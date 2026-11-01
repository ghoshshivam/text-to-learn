const asyncHandler = require("../utils/asyncHandler");
const audioService = require("../services/audioService");

exports.getLessonAudio = asyncHandler(async (req, res) => {
  const wav = await audioService.getLessonAudio(req.params.id, req.user.sub);
  res.set({
    "Content-Type": "audio/wav",
    "Content-Length": wav.length,
    "Cache-Control": "private, max-age=3600",
  });
  res.send(wav);
});