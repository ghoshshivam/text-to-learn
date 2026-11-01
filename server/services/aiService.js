const { ai, MODEL, FALLBACK_MODEL } = require("../config/gemini");
const { cleanJson } = require("../utils/cleanJson");
const { AIGenerationError } = require("../utils/errors");
const {
  courseResponseSchema,
  lessonResponseSchema,
  hinglishResponseSchema,
} = require("../schemas/geminiSchemas");
const {
  courseOutlineSchema,
  lessonSchema,
  hinglishScriptSchema,
} = require("../schemas/validators");
const {
  SYSTEM_INSTRUCTION,
  HINGLISH_SYSTEM_INSTRUCTION,
  generateCoursePrompt,
  generateLessonPrompt,
  generateHinglishPrompt,
} = require("./prompts");

const MAX_VALIDATION_ATTEMPTS = 3; // bad JSON / failed Zod rules
const CALL_TIMEOUT_MS = 40_000; // max time for one Gemini call
const TOTAL_BUDGET_MS = 90_000; // max time for the whole generation
const THINKING_LEVEL = (process.env.GEMINI_THINKING_LEVEL || "low").toUpperCase();
const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const statusOf = (err) => err?.status ?? err?.code;
const isValidationError = (err) => Boolean(err?.issues) || err instanceof SyntaxError;
const isTimeout = (err) =>
  err?.name === "TimeoutError" || err?.name === "AbortError" || /abort|timed? ?out/i.test(err?.message || "");
const isBusy = (err) => TRANSIENT_STATUS.has(statusOf(err)) || isTimeout(err);

const describeProblem = (err) =>
  err.issues
    ? err.issues
        .slice(0, 6)
        .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
        .join("; ")
    : err.message;

// Gemini 3.x models take thinkingLevel; older models would reject it
const buildConfig = (model, responseSchema, signal, systemInstruction) => ({
  systemInstruction,
  responseMimeType: "application/json",
  responseSchema,
  abortSignal: signal,
  ...(model.startsWith("gemini-3") && { thinkingConfig: { thinkingLevel: THINKING_LEVEL } }),
});

async function generateStructured({
  prompt,
  responseSchema,
  validator,
  label,
  systemInstruction = SYSTEM_INSTRUCTION,
}) {
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let currentPrompt = prompt;
  let model = MODEL;
  let fallbackUsable = Boolean(FALLBACK_MODEL);
  let validationFailures = 0;
  let transientFailures = 0;
  let lastError;

  while (validationFailures < MAX_VALIDATION_ATTEMPTS) {
    const remaining = deadline - Date.now();
    if (remaining < 5_000) break; // out of time budget

    try {
      const response = await ai.models.generateContent({
        model,
        contents: currentPrompt,
        config: buildConfig(
          model,
          responseSchema,
          AbortSignal.timeout(Math.min(CALL_TIMEOUT_MS, remaining)),
          systemInstruction
        ),
      });

      const raw = response.text;
      if (!raw) throw new SyntaxError("Empty response from model");

      return validator.parse(JSON.parse(cleanJson(raw)));
    } catch (err) {
      lastError = err;

      if (isValidationError(err)) {
        validationFailures++;
        const problem = describeProblem(err);
        console.warn(`[ai] ${label}: invalid output (${validationFailures}/${MAX_VALIDATION_ATTEMPTS}) -> ${problem}`);
        currentPrompt =
          `${prompt}\n\nYour previous answer was rejected: ${problem}. ` +
          `Every block must include all the fields required for its type. Answer again.`;
      } else if (isBusy(err)) {
        transientFailures++;
        console.warn(`[ai] ${label}: busy or slow (${statusOf(err) ?? err.name}) on ${model}, retry ${transientFailures}`);

        if (fallbackUsable && model !== FALLBACK_MODEL) {
          model = FALLBACK_MODEL;
          console.warn(`[ai] switching to fallback model: ${FALLBACK_MODEL}`);
        }
        const delay = Math.min(1000 * 2 ** (transientFailures - 1), 8000) + Math.random() * 500;
        if (deadline - Date.now() - delay < 5_000) break;
        await sleep(delay);
      } else if (model === FALLBACK_MODEL && [400, 404].includes(statusOf(err))) {
        // the fallback name is wrong or unsupported: stop using it
        fallbackUsable = false;
        model = MODEL;
        console.warn(`[ai] fallback model "${FALLBACK_MODEL}" failed (${statusOf(err)}); using ${MODEL} only`);
      } else {
        break; // bad key, bad request, etc. Retrying cannot help.
      }
    }
  }

  const busy = (lastError && isBusy(lastError)) || Date.now() >= deadline - 5_000;
  throw new AIGenerationError(
    busy
      ? "The AI service is busy right now. Please try again in a minute."
      : `Could not generate ${label}. Please try again.`,
    { cause: lastError, statusCode: busy ? 503 : 502 }
  );
}

async function generateCourse(topic) {
  const cleanTopic = String(topic ?? "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  if (cleanTopic.length < 3 || cleanTopic.length > 200) {
    throw new AIGenerationError("Topic must be between 3 and 200 characters.", { statusCode: 400 });
  }

  return generateStructured({
    prompt: generateCoursePrompt(cleanTopic),
    responseSchema: courseResponseSchema,
    validator: courseOutlineSchema,
    label: "course outline",
  });
}

async function generateLesson({ course, module, lesson }) {
  return generateStructured({
    prompt: generateLessonPrompt(course, module, lesson),
    responseSchema: lessonResponseSchema,
    validator: lessonSchema,
    label: "lesson",
  });
}

async function generateHinglishScript(sourceText) {
  const { segments } = await generateStructured({
    prompt: generateHinglishPrompt(sourceText),
    systemInstruction: HINGLISH_SYSTEM_INSTRUCTION,
    responseSchema: hinglishResponseSchema,
    validator: hinglishScriptSchema,
    label: "Hinglish narration",
  });
  return segments;
}

module.exports = {
  generateCourse,
  generateLesson,
  generateHinglishScript,
};