const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Add it to server/.env");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || null;

module.exports = { ai, MODEL, FALLBACK_MODEL };