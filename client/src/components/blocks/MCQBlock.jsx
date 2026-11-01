import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function MCQBlock({ number, question, options, answer, explanation, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const answered = selected !== null;

  const choose = (index) => {
    if (answered) return;
    setSelected(index);
    onAnswer?.(index === answer);
  };

  const optionClass = (i) => {
    const base = "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition";
    if (!answered) return `${base} border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50`;
    if (i === answer) return `${base} border-emerald-300 bg-emerald-50 text-emerald-900`;
    if (i === selected) return `${base} border-red-300 bg-red-50 text-red-900`;
    return `${base} border-slate-200 bg-white opacity-60`;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-medium text-slate-900">
        <span className="mr-2 text-indigo-600">Q{number}.</span>
        {question}
      </p>
      <div className="mt-4 space-y-2" role="radiogroup" aria-label={`Question ${number}`}>
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            disabled={answered}
            onClick={() => choose(i)}
            className={optionClass(i)}
          >
            <span className="mt-0.5 w-5 shrink-0 font-semibold text-slate-400">{LETTERS[i]}</span>
            <span className="flex-1">{option}</span>
            {answered && i === answer && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
            {answered && i === selected && i !== answer && <XCircle className="h-5 w-5 shrink-0 text-red-600" />}
          </button>
        ))}
      </div>
      {answered && (
        <div
          role="status"
          className={`mt-4 rounded-xl p-4 text-sm ${
            selected === answer ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
          }`}
        >
          <p className="font-semibold">{selected === answer ? "Correct!" : "Not quite."}</p>
          <p className="mt-1">{explanation}</p>
        </div>
      )}
    </div>
  );
}
