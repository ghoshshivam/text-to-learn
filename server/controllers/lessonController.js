const asyncHandler = require("../utils/asyncHandler");
const lessonService = require("../services/lessonService");

exports.generateLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.enrichLesson(req.body.lessonId, req.user.sub);
  res.json({ success: true, data: lessonService.serializeLesson(lesson) });
});

exports.getLesson = asyncHandler(async (req, res) => {
  const lesson = await lessonService.findOwnedLesson(req.params.id, req.user.sub);
  res.json({ success: true, data: lessonService.serializeLesson(lesson) });
});