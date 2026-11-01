const asyncHandler = require("../utils/asyncHandler");
const { generateCourse: generateOutline } = require("../services/aiService");
const courseService = require("../services/courseService");

exports.generateCourse = asyncHandler(async (req, res) => {
  const outline = await generateOutline(req.body.topic);
  const course = await courseService.createCourseFromOutline(req.user.sub, outline);
  res.status(201).json({ success: true, data: course });
});

exports.getUserCourses = asyncHandler(async (req, res) => {
  const courses = await courseService.listUserCourses(req.user.sub);
  res.json({ success: true, data: courses });
});

exports.getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseTree(req.params.id, req.user.sub);
  res.json({ success: true, data: course });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(req.params.id, req.user.sub);
  res.json({ success: true, data: { id: req.params.id } });
});