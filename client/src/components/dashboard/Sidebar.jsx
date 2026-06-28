// Sidebar.jsx — persistent left navigation panel shown on the dashboard (desktop only).
// Displays the user's avatar, progress snapshot, nav links, and a logout button.
// Hidden on mobile — the main Navbar handles navigation on small screens.

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Trophy,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import API_BASE from "../../utils/api.js";

// exact: true on Dashboard means the link only highlights when the path is exactly
// "/dashboard" — without it, every sub-path like "/dashboard/history" would also highlight.
const NAV_ITEMS = [
  { label: "Dashboard",   icon: LayoutDashboard, to: "/dashboard",           exact: true  },
  { label: "Mock Tests",  icon: ClipboardList,   to: "/practice/mock-tests", exact: false },
  { label: "My Results",  icon: Trophy,          to: "/dashboard/history",   exact: false },
  { label: "Profile",     icon: User,            to: "/profile/settings",    exact: false },
  { label: "Help Center", icon: HelpCircle,      to: "/help/faqs",           exact: false },
];

export default function Sidebar({ username, targetLabel, experienceLabel, daysLeft }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("avatarUrl") || "");
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const sync = () => {
      setAvatarUrl(localStorage.getItem("avatarUrl") || "");
      setImgError(false);
    };
    window.addEventListener("user-profile-updated", sync);
    return () => window.removeEventListener("user-profile-updated", sync);
  }, []);

  const initials = username ? username.slice(0, 2).toUpperCase() : "U";
  const subtitle = targetLabel || experienceLabel || "Interview Prep";

  const isActive = ({ to, exact }) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* proceed regardless */ }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("avatarUrl");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      {/* top-17 = 68px, which is the Navbar height. Keeps the sidebar visually below it. */}
      <div className="sticky top-17 flex h-[calc(100vh-4.75rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">

        <div className="shrink-0 border-b border-slate-100 p-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {avatarUrl && !imgError ? (
              <img
                src={avatarUrl}
                alt="avatar"
                onError={() => setImgError(true)}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-blue-100 dark:ring-slate-700"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {username || "User"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="mt-2.5 rounded-xl bg-indigo-50 p-2.5 dark:bg-indigo-500/10">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                🎯 Interview Prep
              </span>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">30%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/40">
              <div className="h-full w-[30%] rounded-full bg-linear-to-r from-blue-500 to-teal-400" />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span>🔥 <span className="font-semibold text-amber-500">14 day streak</span></span>
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {daysLeft !== null ? `${daysLeft}d left` : "—"}
              </span>
            </div>
          </div>
        </div>

        <nav className="shrink-0 px-2.5 py-2">
          <p className="mb-1 px-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Menu
          </p>
          <ul>
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const Icon   = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={17} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        active ? "bg-white/20 text-white" : "bg-rose-500 text-white"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        </div>

        <div className="shrink-0 border-t border-slate-100 p-2.5 dark:border-slate-800">
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 py-2 text-center dark:bg-slate-800">
              <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">76%</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg</p>
            </div>
            <div className="rounded-xl bg-slate-50 py-2 text-center dark:bg-slate-800">
              <p className="text-base font-extrabold text-amber-500">#124</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rank</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition-colors duration-150 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

      </div>
    </aside>
  );
}
