import { useVideo } from "../../hooks/useCourses";

const C = {
  text: "#1e293b",
  muted: "#64748b",
  brand: "#4f46e5",
  line: "#e2e8f0",
  codeBg: "#f1f5f9",
  ok: "#047857",
  okBg: "#ecfdf5",
};

const LETTERS = ["A", "B", "C", "D", "E"];
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

// **bold** and `code` as real formatting; never injects raw HTML
function inline(text) {
  return String(text)
    .split(TOKEN)
    .map((part, i) => {
      if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            style={{
              background: C.codeBg,
              padding: "1px 5px",
              borderRadius: 4,
              fontSize: "0.9em",
              fontFamily: "Consolas, 'Courier New', monospace",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
}

function PdfVideo({ query }) {
  const { data } = useVideo(query);
  const url = data
    ? `https://www.youtube.com/watch?v=${data.videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
      <div style={{ fontWeight: 600 }}>Video: {data?.title || query}</div>
      {/* Added data-pdf-link and cursor */}
      <div
        data-pdf-link={url}
        style={{ color: C.brand, wordBreak: "break-all", marginTop: 2, cursor: "pointer" }}
      >
        {url}
      </div>
    </div>
  );
}

export default function PdfLesson({
  courseTitle,
  moduleTitle,
  lessonTitle,
  objectives = [],
  content = [],
}) {
  let mcqNumber = 0;
  let headingCount = 0;

  return (
    <div
      style={{
        width: 794, // A4 width at 96 dpi
        boxSizing: "border-box",
        padding: "40px 48px",
        background: "#ffffff",
        color: C.text,
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        fontSize: 14,
        lineHeight: 1.65,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Header */}
      <div data-block data-keep style={{ borderBottom: `3px solid ${C.brand}`, paddingBottom: 14 }}>
        <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
          {courseTitle} · {moduleTitle}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, lineHeight: 1.25 }}>
          {lessonTitle}
        </div>
      </div>

      {/* Objectives */}
      {objectives.length > 0 && (
        <div data-block style={{ background: "#eef2ff", borderRadius: 10, padding: "14px 18px" }}>
          <div style={{ fontWeight: 700, color: "#3730a3", marginBottom: 6 }}>Learning objectives</div>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lesson content */}
      {content.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const first = headingCount++ === 0;
            return (
              <div
                key={i}
                data-block
                data-keep
                style={{
                  fontSize: first ? 21 : 17,
                  fontWeight: 700,
                  marginTop: first ? 4 : 10,
                }}
              >
                {block.text}
              </div>
            );
          }
          case "paragraph":
            return (
              <div key={i} data-block style={{ whiteSpace: "pre-line" }}>
                {inline(block.text)}
              </div>
            );
          case "code":
            return (
              <div
                key={i}
                data-block
                style={{
                  background: C.codeBg,
                  border: `1px solid ${C.line}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginBottom: 6 }}>
                  {block.language}
                </div>
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: 12,
                    lineHeight: 1.5,
                    fontFamily: "Consolas, 'Courier New', monospace",
                  }}
                >
                  {block.text}
                </pre>
              </div>
            );
          case "video":
            return (
              <div key={i} data-block>
                <PdfVideo query={block.query} />
              </div>
            );
          case "mcq": {
            const number = ++mcqNumber;
            return (
              <div
                key={i}
                data-block
                style={{
                  border: `1px solid ${C.line}`,
                  borderRadius: 10,
                  padding: "12px 16px",
                }}
              >
                {number === 1 && (
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
                    Check your understanding
                  </div>
                )}
                <div style={{ fontWeight: 600 }}>
                  Q{number}. {block.question}
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {block.options.map((opt, j) => {
                    const correct = j === block.answer;
                    return (
                      <div
                        key={j}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 6,
                          background: correct ? C.okBg : "transparent",
                          color: correct ? C.ok : C.text,
                          fontWeight: correct ? 600 : 400,
                        }}
                      >
                        {LETTERS[j]}. {opt} {correct ? "✓" : ""}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: C.muted }}>
                  <strong>Why:</strong> {block.explanation}
                </div>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}