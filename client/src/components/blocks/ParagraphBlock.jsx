const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

function renderInline(text) {
  return text.split(TOKEN).map((part, i) => {
    if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-indigo-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function ParagraphBlock({ text }) {
  return <p className="whitespace-pre-line leading-7 text-slate-700">{renderInline(text)}</p>;
}