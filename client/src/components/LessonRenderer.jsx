import { Fragment, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import HeadingBlock from "./blocks/HeadingBlock";
import ParagraphBlock from "./blocks/ParagraphBlock";
import CodeBlock from "./blocks/CodeBlock";
import VideoBlock from "./blocks/VideoBlock";
import MCQBlock from "./blocks/MCQBlock";

export default function LessonRenderer({ content = [] }) {
  const [results, setResults] = useState({}); // question number -> correct?
  const [quizKey, setQuizKey] = useState(0); // changing it resets every question

  const total = content.filter((b) => b.type === "mcq").length;
  const answered = Object.keys(results).length;
  const score = Object.values(results).filter(Boolean).length;

  const retake = () => {
    setResults({});
    setQuizKey((k) => k + 1);
  };

  let headingCount = 0;
  let mcqNumber = 0;

  return (
    <div className="space-y-5">
      {content.map((block, i) => {
        switch (block.type) {
          case "heading":
            return <HeadingBlock key={i} text={block.text} isFirst={headingCount++ === 0} />;
          case "paragraph":
            return <ParagraphBlock key={i} text={block.text} />;
          case "code":
            return <CodeBlock key={i} language={block.language} text={block.text} />;
          case "video":
            return <VideoBlock key={i} query={block.query} />;
          case "mcq": {
            const number = ++mcqNumber;
            return (
              <Fragment key={`${quizKey}-${i}`}>
                {number === 1 && (
                  <h2 className="pt-6 text-2xl font-bold text-slate-900">Check your understanding</h2>
                )}
                <MCQBlock
                  number={number}
                  question={block.question}
                  options={block.options}
                  answer={block.answer}
                  explanation={block.explanation}
                  onAnswer={(correct) => setResults((r) => ({ ...r, [number]: correct }))}
                />
              </Fragment>
            );
          }
          default:
            return null; // unknown block type: skip safely
        }
      })}

      {total > 0 && answered === total && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8" />
            <div>
              <p className="text-lg font-semibold">
                You scored {score} / {total}
              </p>
              <p className="text-sm text-indigo-100">
                {score === total ? "Perfect! On to the next lesson." : "Review the explanations and try again."}
              </p>
            </div>
          </div>
          <button
            onClick={retake}
            className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25"
          >
            <RotateCcw className="h-4 w-4" /> Retake quiz
          </button>
        </div>
      )}
    </div>
  );
}