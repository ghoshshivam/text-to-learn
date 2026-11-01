const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const generateCourseBody = z.object({
  topic: z.string().trim().min(3, "Topic is too short").max(200, "Topic is too long"),
});

const generateLessonBody = z.object({ lessonId: objectId });
const idParam = z.object({ id: objectId });

module.exports = { generateCourseBody, generateLessonBody, idParam };