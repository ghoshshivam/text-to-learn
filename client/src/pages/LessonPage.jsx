import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCourse, useLesson } from "../hooks/useCourses";
import { getErrorMessage } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import NotFoundPage from "./NotFoundPage";

export default function LessonPage() {
  const { courseId, moduleIndex, lessonIndex } = useParams();
  const mi = Number(moduleIndex);
  const li = Number(lessonIndex);
  const qc = useQueryClient();

  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const lessonRef = course?.modules?.[mi]?.lessons?.[li];
  const { data: lesson, isLoading, error, refetch } = useLesson(lessonRef?._id);

  useEffect(() => {
    if (lesson) qc.invalidateQueries({ queryKey: ["course", courseId] });
  }, [lesson, courseId, qc]);

  if (courseLoading) return <LoadingSpinner label="Loading..." />;
  if (courseError) return <ErrorMessage message={getErrorMessage(courseError)} />;
  if (!lessonRef) return <NotFoundPage message="This lesson does not exist." />;

  const flat = course.modules.flatMap((m, a) => m.lessons.map((l, b) => ({ a, b, title: l.title })));
  const pos = flat.findIndex((x) => x.a === mi && x.b === li);
  const prev = flat[pos - 1];
  const next = flat[pos + 1];
  const lessonPath = (x) => `/courses/${courseId}/module/${x.a}/lesson/${x.b}`;

  return (
    <article className="space-y-6">
      <nav className="text-sm text-slate-500">
        <Link to={`/courses/${courseId}`} className="hover:text-indigo-600">
          {course.title}
        </Link>
        <span className="mx-2">/</span>
        <span>Module {mi + 1}</span>
      </nav>
      <h1 className="text-3xl font-bold">{lessonRef.title}</h1>
      {isLoading && (
        <LoadingSpinner label="Writing this lesson for you... first time only, about 20 seconds." />
      )}
      {error && <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />}
      {lesson && (
        <>
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <h2 className="mb-2 font-semibold text-indigo-900">Learning objectives</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-indigo-900">
              {lesson.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
          <pre className="max-h-[32rem] overflow-auto rounded-2xl bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(lesson.content, null, 2)}
          </pre>
        </>
      )}
      <div className="flex justify-between border-t border-slate-200 pt-4">
        {prev ? (
          <Link to={lessonPath(prev)} className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /> {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={lessonPath(next)} className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline">
            {next.title} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}