const Lesson = require("../models/Lesson");
const { generateLesson } = require("./aiService");
const { AppError } = require("../utils/errors");

const inFlight = new Map(); // lessonId -> promise of the running generation

const notFound = () =>
  new AppError("Lesson not found", { statusCode: 404, code: "LESSON_NOT_FOUND" });

// Loads a lesson with its module and course. 404 if missing or not yours.
async function findOwnedLesson(lessonId, userSub) {
  const lesson = await Lesson.findById(lessonId).populate({
    path: "module",
    select: "title course",
    populate: { path: "course", select: "title creator" },
  });
  if (!lesson || lesson.module?.course?.creator !== userSub) throw notFound();
  return lesson;
}

async function enrichLesson(lessonId, userSub) {
  const lesson = await findOwnedLesson(lessonId, userSub);
  if (lesson.isEnriched) return lesson; // already generated: no AI call

  const key = String(lesson._id);
  if (!inFlight.has(key)) {
    const job = generateLesson({
      course: lesson.module.course.title,
      module: lesson.module.title,
      lesson: lesson.title,
    })
      .then(async (data) => {
        lesson.objectives = data.objectives;
        lesson.content = data.content;
        lesson.isEnriched = true;
        await lesson.save();
        return lesson;
      })
      .finally(() => inFlight.delete(key));
    inFlight.set(key, job);
  }
  return inFlight.get(key);
}

const serializeLesson = (lesson) => ({
  _id: lesson._id,
  title: lesson.title,
  objectives: lesson.objectives,
  content: lesson.content,
  isEnriched: lesson.isEnriched,
  moduleId: lesson.module._id,
  courseId: lesson.module.course._id,
});

module.exports = { findOwnedLesson, enrichLesson, serializeLesson };