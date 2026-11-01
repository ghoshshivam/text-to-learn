const { z } = require("zod");

const text = z.string().trim().min(1);

/* Course outline rules */
const courseOutlineSchema = z.object({
  title: text.max(120),
  description: text.max(800),
  tags: z.array(text.max(40)).min(2).max(8),
  modules: z
    .array(
      z.object({
        title: text.max(140),
        lessons: z.array(text.max(140)).min(3).max(5),
      })
    )
    .min(3)
    .max(6),
});

/* Lesson blocks rules */
const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text }),
  z.object({ type: z.literal("paragraph"), text }),
  z.object({ type: z.literal("code"), language: text, text }),
  z.object({ type: z.literal("video"), query: text.max(150) }),
  z.object({
    type: z.literal("mcq"),
    question: text,
    options: z.array(text).min(3).max(5),
    answer: z.number().int().min(0),
    explanation: text,
  }),
]);

const lessonSchema = z
  .object({
    title: text.max(160),
    objectives: z.array(text.max(220)).min(3).max(5),
    content: z.array(blockSchema).min(6),
  })
  .superRefine((lesson, ctx) => {
    const mcqs = lesson.content.filter((b) => b.type === "mcq");
    const videos = lesson.content.filter((b) => b.type === "video");

    if (mcqs.length < 4 || mcqs.length > 5) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: `Lesson must contain 4-5 mcq blocks, found ${mcqs.length}`,
      });
    }

    if (videos.length !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: `Lesson must contain exactly 1 video block, found ${videos.length}`,
      });
    }

    lesson.content.forEach((block, i) => {
      if (block.type === "mcq" && block.answer >= block.options.length) {
        ctx.addIssue({
          code: "custom",
          path: ["content", i, "answer"],
          message: "mcq answer must be a valid zero-based index into options",
        });
      }
    });
  });

/* Hinglish narration script validator */
const hinglishScriptSchema = z.object({
  segments: z.array(text.max(900)).min(1).max(40),
});

module.exports = {
  courseOutlineSchema,
  lessonSchema,
  hinglishScriptSchema,
};