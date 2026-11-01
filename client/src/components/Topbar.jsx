import { Menu } from "lucide-react";

export default function Topbar({ onMenu }) {
  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      <button onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 hover:bg-slate-100">
        <Menu className="h-5 w-5" />
      </button>
      <span className="font-semibold">Text-to-Learn</span>
    </header>
  );
}