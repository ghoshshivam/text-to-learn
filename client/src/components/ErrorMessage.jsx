import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1 text-sm">
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 font-medium underline hover:no-underline">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}