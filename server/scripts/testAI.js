require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { generateCourse, generateLesson } = require("../services/aiService");

(async () => {
  const topic = process.argv[2] || "Intro to React Hooks";

  console.log(`\nGenerating course outline for: "${topic}"...`);
  console.time("course");
  const course = await generateCourse(topic);
  console.timeEnd("course");
  console.log(JSON.stringify(course, null, 2));

  const firstModule = course.modules[0];
  console.log(`\nGenerating lesson for: "${firstModule.lessons[0]}"...`);
  console.time("lesson");
  const lesson = await generateLesson({
    course: course.title,
    module: firstModule.title,
    lesson: firstModule.lessons[0],
  });
  console.timeEnd("lesson");
  console.log(JSON.stringify(lesson, null, 2));
})().catch((err) => {
  console.error("FAILED:", err.message, err.cause?.message ?? "");
  process.exit(1);
});