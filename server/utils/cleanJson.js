/**
 * Fallback cleaner: strips markdown code fences and isolates JSON strings.
 */
function cleanJson(text) {
  let s = String(text ?? "").trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = s.search(/[\[{]/);
  const end = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (start !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  return s;
}

module.exports = { cleanJson };