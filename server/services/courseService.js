const mongoose = require("mongoose");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const { AppError } = require("../utils/errors");

const notFound = () =>
  new AppError("Course not found", { statusCode: 404, code: "COURSE_NOT_FOUND" });

const { ObjectId } = mongoose.Types;

// Full course with modules and lesson titles. 404 if missing or not yours.
async function getCourseTree(courseId, userSub) {
  const course = await Course.findById(courseId)
    .populate({
      path: "modules",
      populate: { path: "lessons", select: "title isEnriched" },
    })
    .lean();
  if (!course || course.creator !== userSub) throw notFound();
  return course;
}

async function findOwnedCourse(courseId, userSub) {
  const course = await Course.findById(courseId);
  if (!course || course.creator !== userSub) throw notFound();
  return course;
}

// Saves an AI outline as Course > Modules > Lessons (title-only lessons)
async function createCourseFromOutline(creator, outline) {
  const courseId = new ObjectId();
  const moduleDocs = [];
  const lessonDocs = [];

  for (const m of outline.modules) {
    const moduleId = new ObjectId();
    const lessonIds = [];

    for (const title of m.lessons) {
      const lessonId = new ObjectId();
      lessonIds.push(lessonId);
      lessonDocs.push({ _id: lessonId, title, module: moduleId, objectives: [], content: [], isEnriched: false });
    }
    moduleDocs.push({ _id: moduleId, title: m.title, course: courseId, lessons: lessonIds });
  }

  const moduleIds = moduleDocs.map((m) => m._id);

  try {
    await Lesson.insertMany(lessonDocs);
    await Module.insertMany(moduleDocs);
    await Course.create({
      _id: courseId,
      title: outline.title,
      description: outline.description,
      tags: outline.tags,
      creator,
      modules: moduleIds,
    });
  } catch (err) {
    // roll back partial data
    await Promise.allSettled([
      Lesson.deleteMany({ _id: { $in: lessonDocs.map((l) => l._id) } }),
      Module.deleteMany({ _id: { $in: moduleIds } }),
      Course.deleteOne({ _id: courseId }),
    ]);
    throw err;
  }

  return getCourseTree(courseId, creator);
}

async function listUserCourses(userSub) {
  const courses = await Course.find({ creator: userSub })
    .sort({ createdAt: -1 })
    .select("title description tags modules createdAt")
    .lean();
  return courses.map(({ modules, ...course }) => ({ ...course, moduleCount: modules.length }));
}

async function deleteCourse(courseId, userSub) {
  const course = await findOwnedCourse(courseId, userSub);
  await Lesson.deleteMany({ module: { $in: course.modules } });
  await Module.deleteMany({ course: course._id });
  await course.deleteOne();
}

module.exports = { createCourseFromOutline, getCourseTree, listUserCourses, deleteCourse };