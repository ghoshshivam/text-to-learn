const { ai } = require("../config/gemini");
const { AppError } = require("../utils/errors");
const { pcmToWav, silence } = require("../utils/wav");

const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";
const VOICE = process.env.GEMINI_TTS_VOICE || "Kore";
const LANGUAGE = process.env.GEMINI_TTS_LANGUAGE || "hi-IN";
const STYLE = "Say in a warm, friendly teacher's voice at a calm pace:";

const MAX_ATTEMPTS = 4;
const TRANSIENT = new Set([429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isTimeout = (err) =>
  err?.name === "TimeoutError" || err?.name === "AbortError" || /abort|timed? ?out/i.test(err?.message || "");

// Groups short script segments into chunks of about 1500 characters (fewer API calls)
function chunkSegments(segments, max = 1500) {
  const chunks = [];
  let current = "";
  for (const segment of segments) {
    if (current && current.length + segment.length + 1 > max) {
      chunks.push(current);
      current = segment;
    } else {
      current = current ? `${current} ${segment}` : segment;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function synthesizeChunk(text) {
  let languageCode = LANGUAGE;
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: `${STYLE}\n\n${text}`,
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
            ...(languageCode && { languageCode }),
          },
          abortSignal: AbortSignal.timeout(60_000),
        },
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const data = parts.find((p) => p.inlineData?.data)?.inlineData?.data;
      if (!data) throw Object.assign(new Error("No audio returned"), { status: 500 }); // treated as transient

      return Buffer.from(data, "base64");
    } catch (err) {
      lastError = err;
      const status = err?.status ?? err?.code;
      console.warn(`[tts] attempt ${attempt}/${MAX_ATTEMPTS} failed (${status ?? err.name}): ${err.message?.slice(0, 160)}`);

      if (status === 400 && languageCode) {
        languageCode = undefined; // the language option was rejected: retry without it
        continue;
      }
      if (!(TRANSIENT.has(status) || isTimeout(err)) || attempt === MAX_ATTEMPTS) break;
      await sleep(1000 * 2 ** (attempt - 1));
    }
  }

  throw new AppError("Could not create the audio right now. Please try again in a minute.", {
    statusCode: 503,
    code: "TTS_FAILED",
    cause: lastError,
  });
}

// segments (Hinglish text) -> one WAV buffer
async function synthesizeSpeech(segments) {
  const pcmParts = [];
  for (const chunk of chunkSegments(segments)) {
    pcmParts.push(await synthesizeChunk(chunk)); // one at a time to respect rate limits
    pcmParts.push(silence(0.35));
  }
  return pcmToWav(Buffer.concat(pcmParts));
}

module.exports = { synthesizeSpeech };