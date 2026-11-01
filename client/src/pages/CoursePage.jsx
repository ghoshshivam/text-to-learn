import { Link, useParams } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { useCourse } from "../hooks/useCourses";
import { getErrorMessage } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function CoursePage() {
  const { courseId } = useParams();
  const { data: course, isLoading, error, refetch } = useCourse(courseId);

  if (isLoading) return <LoadingSpinner label="Loading course..." />;
  if (error) return <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {course.tags?.map((t) => (
            <span key={t} className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
              {t}
            </span>
          ))}
        </div>
      </header>
      <div className="space-y-4">
        {course.modules.map((mod, mi) => (
          <section key={mod._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 px-5 py-4 font-semibold">
              <span className="mr-2 text-indigo-600">Module {mi + 1}</span>
              {mod.title}
            </h2>
            <ul className="divide-y divide-slate-100">
              {mod.lessons.map((lesson, li) => (
                <li key={lesson._id}>
                  <Link
                    to={`/courses/${course._id}/module/${mi}/lesson/${li}`}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition hover:bg-slate-50"
                  >
                    <span className="w-6 text-slate-400">{li + 1}.</span>
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.isEnriched && <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-label="Ready" />}
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}