const MAX_SOURCE_CHARS = 9000; // keeps audio length and cost bounded

const clean = (s) =>
  String(s ?? "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

// Turns lesson blocks into plain text the translator can narrate
function buildNarrationSource(lesson) {
  const parts = [`Lesson title: ${clean(lesson.title)}`];

  if (lesson.objectives?.length) {
    parts.push(`By the end of this lesson you will be able to: ${lesson.objectives.map(clean).join("; ")}.`);
  }

  for (const block of lesson.content) {
    if (block.type === "heading") parts.push(`Section: ${clean(block.text)}`);
    else if (block.type === "paragraph") parts.push(clean(block.text));
    else if (block.type === "code") {
      const snippet = String(block.text).slice(0, 500);
      parts.push(
        `[A ${block.language} code example is shown on screen. Describe in one or two sentences what it demonstrates. Do not read the code aloud. Code: ${snippet}]`
      );
    }
    // video and quiz blocks are skipped on purpose
  }

  parts.push("Now try the quiz questions below the lesson to check your understanding.");

  const text = parts.join("\n\n");
  return text.length > MAX_SOURCE_CHARS ? `${text.slice(0, MAX_SOURCE_CHARS)}\n\n[The lesson continues on screen.]` : text;
}

module.exports = { buildNarrationSource };