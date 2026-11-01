import { Link, NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { BookOpen, GraduationCap, Home, LogOut, X } from "lucide-react";
import { useCourses } from "../hooks/useCourses";

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth0();
  const { data: courses = [] } = useCourses();

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-900 p-4 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
            <GraduationCap className="h-6 w-6 text-indigo-400" /> Text-to-Learn
          </Link>
          <button onClick={onClose} className="text-slate-400 lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          <NavLink to="/" end className={linkClass}>
            <Home className="h-4 w-4" /> Home
          </NavLink>
        </nav>
        <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Recent courses
        </p>
        <nav className="-mx-1 flex-1 space-y-1 overflow-y-auto px-1">
          {courses.length === 0 && <p className="px-3 text-sm text-slate-500">No courses yet</p>}
          {courses.slice(0, 10).map((c) => (
            <NavLink key={c._id} to={`/courses/${c._id}`} className={linkClass}>
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="truncate">{c.title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
          {user?.picture && <img src={user.picture} alt="" className="h-9 w-9 rounded-full" />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            aria-label="Log out"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
}