const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    objectives: [{ type: String }],
    content: { type: [mongoose.Schema.Types.Mixed], default: [] }, // blocks
    isEnriched: { type: Boolean, default: false },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);