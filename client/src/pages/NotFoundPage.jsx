import { Link } from "react-router-dom";

export default function NotFoundPage({ message = "Page not found." }) {
  return (
    <div className="py-24 text-center">
      <h1 className="text-5xl font-bold text-slate-300">404</h1>
      <p className="mt-3 text-slate-600">{message}</p>
      <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
        Back to home
      </Link>
    </div>
  );
}