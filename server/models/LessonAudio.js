const mongoose = require("mongoose");

const lessonAudioSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true, unique: true },
  script: [{ type: String }], // Hinglish narration, kept so a TTS retry skips translation
  audio: Buffer, // finished WAV
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 14 }, // auto-deleted after 14 days
});

module.exports = mongoose.model("LessonAudio", lessonAudioSchema);