const { ai, MODEL, FALLBACK_MODEL } = require("../config/gemini");
const { cleanJson } = require("../utils/cleanJson");
const { AIGenerationError } = require("../utils/errors");
const { courseResponseSchema, lessonResponseSchema } = require("../schemas/geminiSchemas");
const { courseOutlineSchema, lessonSchema } = require("../schemas/validators");
const {
  SYSTEM_INSTRUCTION,
  generateCoursePrompt,
  generateLessonPrompt,
} = require("./prompts");

const MAX_VALIDATION_ATTEMPTS = 3; // bad JSON / failed Zod rules
const MAX_TRANSIENT_RETRIES = 5; // 429 / 5xx from Google
const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const statusOf = (err) => err?.status ?? err?.code;
const isValidationError = (err) => Boolean(err?.issues) || err instanceof SyntaxError;

const describeProblem = (err) =>
  err.issues
    ? err.issues
        .slice(0, 6)
        .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
        .join("; ")
    : err.message;

async function generateStructured({ prompt, responseSchema, validator, label }) {
  let currentPrompt = prompt;
  let model = MODEL;
  let validationFailures = 0;
  let transientFailures = 0;
  let lastError;

  while (
    validationFailures < MAX_VALIDATION_ATTEMPTS &&
    transientFailures <= MAX_TRANSIENT_RETRIES
  ) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: currentPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.7,
        },
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
      } else if (TRANSIENT_STATUS.has(statusOf(err))) {
        transientFailures++;
        console.warn(`[ai] ${label}: Google busy (${statusOf(err)}), retry ${transientFailures}/${MAX_TRANSIENT_RETRIES}`);

        if (FALLBACK_MODEL && model !== FALLBACK_MODEL && transientFailures >= 2) {
          model = FALLBACK_MODEL;
          console.warn(`[ai] switching to fallback model: ${FALLBACK_MODEL}`);
        }
        const delay = Math.min(1000 * 2 ** (transientFailures - 1), 15000) + Math.random() * 500;
        await sleep(delay);
      } else {
        break; // bad key, bad request, etc. Retrying cannot help.
      }
    }
  }

  throw new AIGenerationError(`Could not generate ${label}. Please try again.`, {
    cause: lastError,
  });
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

module.exports = { generateCourse, generateLesson };