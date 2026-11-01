import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AuthPage({ mode = "login" }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  const isSignup = mode === "signup";
  const start = () =>
    loginWithRedirect({
      appState: { returnTo: location.state?.from || "/" },
      authorizationParams: isSignup ? { screen_hint: "signup" } : undefined,
    });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <GraduationCap className="mx-auto h-12 w-12 text-indigo-600" />
        <h1 className="mt-4 text-2xl font-bold">Text-to-Learn</h1>
        <p className="mt-2 text-slate-600">Type any topic. Get a complete, structured course.</p>
        <button
          onClick={start}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700"
        >
          {isSignup ? "Create your account" : "Log in"}
        </button>
        <a
          href={isSignup ? "/login" : "/signup"}
          className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
        >
          {isSignup ? "Already have an account? Log in" : "New here? Sign up"}
        </a>
      </div>
    </div>
  );
}