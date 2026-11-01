import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-slate-500" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}