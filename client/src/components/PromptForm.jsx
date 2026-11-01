import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useGenerateCourse } from "../hooks/useCourses";
import { getErrorMessage } from "../utils/api";
import ErrorMessage from "./ErrorMessage";
import LoadingSpinner from "./LoadingSpinner";

const EXAMPLES = [
  "Intro to React Hooks",
  "Basics of Copyright Law",
  "Beginner's Guide to Personal Finance",
  "How Photosynthesis Works",
];

export default function PromptForm() {
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();
  const { mutate, isPending, error, reset } = useGenerateCourse();

  const trimmed = topic.trim();
  const valid = trimmed.length >= 3 && trimmed.length <= 200;

  const submit = (e) => {
    e.preventDefault();
    if (!valid || isPending) return;
    mutate(trimmed, { onSuccess: (course) => navigate(`/courses/${course._id}`) });
  };

  if (isPending) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <LoadingSpinner label={`Designing your course on "${trimmed}"... this can take up to 30 seconds.`} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <label htmlFor="topic" className="mb-2 block text-sm font-medium text-slate-700">
        What do you want to learn?
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="topic"
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            if (error) reset();
          }}
          maxLength={200}
          placeholder="e.g. Intro to React Hooks"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" /> Generate course
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setTopic(ex)}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            {ex}
          </button>
        ))}
      </div>
      {error && (
        <div className="mt-4">
          <ErrorMessage message={getErrorMessage(error)} />
        </div>
      )}
    </form>
  );
}