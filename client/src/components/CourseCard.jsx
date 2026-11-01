import { Link } from "react-router-dom";
import { Layers, Trash2 } from "lucide-react";
import { useDeleteCourse } from "../hooks/useCourses";

export default function CourseCard({ course }) {
  const { mutate: remove, isPending } = useDeleteCourse();

  const onDelete = () => {
    if (window.confirm(`Delete "${course.title}"? This cannot be undone.`)) {
      remove(course._id);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <Link to={`/courses/${course._id}`} className="flex-1">
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{course.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{course.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {course.tags?.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
              {t}
            </span>
          ))}
        </div>
      </Link>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> {course.moduleCount} modules
        </span>
        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
      </div>
      <button
        onClick={onDelete}
        disabled={isPending}
        aria-label={`Delete ${course.title}`}
        className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}