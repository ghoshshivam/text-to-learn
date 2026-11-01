const mongoose = require("mongoose");

const videoCacheSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true },
  videoId: { type: String, required: true },
  title: { type: String, default: "" },
  channel: { type: String, default: "" },
  // MongoDB automatically deletes cached videos after 30 days
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30,
  },
});

module.exports = mongoose.model("VideoCache", videoCacheSchema);