const LessonAudio = require("../models/LessonAudio");
const { findOwnedLesson } = require("./lessonService");
const { buildNarrationSource } = require("./narrationService");
const { generateHinglishScript } = require("./aiService");
const { synthesizeSpeech } = require("./ttsService");
const { AppError } = require("../utils/errors");

const MAX_STORED_BYTES = 14 * 1024 * 1024; // MongoDB documents are limited to 16 MB
const inFlight = new Map(); // lessonId -> running generation

async function build(lesson) {
  const cached = await LessonAudio.findOne({ lesson: lesson._id });
  if (cached?.audio?.length) return Buffer.from(cached.audio);

  // Reuse a saved script so a failed TTS retry does not pay for translation again
  let script = cached?.script;
  if (!script?.length) {
    script = await generateHinglishScript(buildNarrationSource(lesson));
    await LessonAudio.findOneAndUpdate({ lesson: lesson._id }, { $set: { script } }, { upsert: true });
  }

  const wav = await synthesizeSpeech(script);

  if (wav.length <= MAX_STORED_BYTES) {
    await LessonAudio.updateOne({ lesson: lesson._id }, { $set: { audio: wav } }, { upsert: true }).catch((err) =>
      console.warn("[audio] cache write failed:", err.message)
    );
  }
  return wav;
}

async function getLessonAudio(lessonId, userSub) {
  const lesson = await findOwnedLesson(lessonId, userSub); // 404 if missing or not yours
  if (!lesson.isEnriched) {
    throw new AppError("Open the lesson first so it can be generated.", { statusCode: 409, code: "LESSON_NOT_READY" });
  }

  const key = String(lesson._id);
  if (!inFlight.has(key)) {
    inFlight.set(key, build(lesson).finally(() => inFlight.delete(key)));
  }
  return inFlight.get(key);
}

module.exports = { getLessonAudio };