const { Type } = require("@google/genai");

const str = { type: Type.STRING };
const kind = (value) => ({ type: Type.STRING, enum: [value] });

/* ---------- Course outline ---------- */
const courseResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: str,
    description: str,
    tags: { type: Type.ARRAY, items: str },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: str,
          lessons: { type: Type.ARRAY, items: str }, // lesson titles only
        },
        required: ["title", "lessons"],
      },
    },
  },
  required: ["title", "description", "tags", "modules"],
};

/* ---------- Lesson blocks: one strict shape per block type ---------- */
const headingBlock = {
  type: Type.OBJECT,
  properties: { type: kind("heading"), text: str },
  required: ["type", "text"],
};

const paragraphBlock = {
  type: Type.OBJECT,
  properties: { type: kind("paragraph"), text: str },
  required: ["type", "text"],
};

const codeBlock = {
  type: Type.OBJECT,
  properties: { type: kind("code"), language: str, text: str },
  required: ["type", "language", "text"],
};

const videoBlock = {
  type: Type.OBJECT,
  properties: { type: kind("video"), query: str },
  required: ["type", "query"],
};

const mcqBlock = {
  type: Type.OBJECT,
  properties: {
    type: kind("mcq"),
    question: str,
    options: { type: Type.ARRAY, items: str },
    answer: { type: Type.INTEGER },
    explanation: str,
  },
  required: ["type", "question", "options", "answer", "explanation"],
};

const lessonResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: str,
    objectives: { type: Type.ARRAY, items: str },
    content: {
      type: Type.ARRAY,
      items: { anyOf: [headingBlock, paragraphBlock, codeBlock, videoBlock, mcqBlock] },
    },
  },
  required: ["title", "objectives", "content"],
};

module.exports = { courseResponseSchema, lessonResponseSchema };