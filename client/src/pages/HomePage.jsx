import { useAuth0 } from "@auth0/auth0-react";
import PromptForm from "../components/PromptForm";
import CourseCard from "../components/CourseCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { useCourses } from "../hooks/useCourses";
import { getErrorMessage } from "../utils/api";

export default function HomePage() {
  const { user } = useAuth0();
  const { data: courses, isLoading, error, refetch } = useCourses();
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-1 text-2xl font-bold">Welcome{firstName ? `, ${firstName}` : ""}</h1>
        <p className="mb-5 text-slate-600">Turn any topic into a full course in seconds.</p>
        <PromptForm />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Your courses</h2>
        {isLoading && <LoadingSpinner label="Loading your courses..." />}
        {error && <ErrorMessage message={getErrorMessage(error)} onRetry={refetch} />}
        {courses?.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No courses yet. Generate your first one above.
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {courses?.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      </section>
    </div>
  );
}