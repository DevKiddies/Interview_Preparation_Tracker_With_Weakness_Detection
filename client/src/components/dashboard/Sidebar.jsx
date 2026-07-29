// Sidebar.jsx — persistent left navigation panel shown on the dashboard (desktop only).
// Displays the user's avatar, progress snapshot, nav links, and a logout button.

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  User,
  HelpCircle,
  LogOut,
  Flame,
  Clock,
  Sparkles,
  History,
} from "lucide-react";
import API_BASE from "../../utils/api.js";

const NAV_ITEMS = [
  { label: "Dashboard",      icon: LayoutDashboard, to: "/dashboard",           exact: true  },
  { label: "Mock Tests",     icon: ClipboardList,   to: "/practice/mock-tests", exact: false },
  { label: "History", icon: History,       to: "/interview-history",   exact: false },
  { label: "Profile",        icon: User,            to: "/profile/settings",    exact: false },
  { label: "Help Center",    icon: HelpCircle,      to: "/help/faqs",           exact: false },
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
        {/* Outer Shell preserved strictly as requested */}
        <div className="sticky top-23 flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">

          {/* Inner Scrollable Wrapper */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">

            {/* User Profile & Progress Header */}
            <div className="shrink-0 space-y-2 border-b border-slate-100 p-2.5 dark:border-slate-800/80">
              {/* User Identity Row */}
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  {avatarUrl && !imgError ? (
                      <img
                          src={avatarUrl}
                          alt="avatar"
                          onError={() => setImgError(true)}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20 dark:ring-slate-700"
                      />
                  ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-500/30">
                        {initials}
                      </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                    {username || "User"}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                    <Sparkles size={10} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                    <span className="truncate">{subtitle}</span>
                  </div>
                </div>
              </div>

              {/* Compact Preparation Widget (Now Clickable Shortcut) */}
              <button
                  onClick={() => navigate("/interview-settings")}
                  className="w-full rounded-lg border border-indigo-100/80 bg-indigo-50/50 p-2 text-left transition hover:border-indigo-200 hover:bg-indigo-100/60 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20"
              >
                <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-950 dark:text-indigo-200">
                  <span>30% Completed</span>
                  <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                    <Flame size={12} className="fill-amber-500 text-amber-500" />
                    <span>14d streak</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-indigo-200/50 dark:bg-indigo-950/60">
                  <div
                      className="h-full rounded-full bg-linear-to-r from-blue-500 to-teal-400 transition-all duration-500"
                      style={{ width: "30%" }}
                  />
                </div>

                {/* Interview Goal Status Footer */}
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Interview Goal</span>
                  <span className="flex items-center gap-0.5 font-medium">
                    <Clock size={10} className="text-slate-400" />
                    <span>
                      {daysLeft === null
                          ? "No Interview"
                          : daysLeft === 0
                              ? "Interview Today"
                              : `${daysLeft}d left`}
                    </span>
                  </span>
                </div>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="shrink-0 px-2 py-2">
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Menu
              </p>
              <ul className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item);
                  const Icon   = item.icon;
                  return (
                      <li key={item.label}>
                        <Link
                            to={item.to}
                            className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                                active
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                            }`}
                        >
                          <Icon
                              size={16}
                              className={`transition-transform duration-150 group-hover:scale-105 ${
                                  active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                              }`}
                          />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
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

          {/* Footer Area with Compact Micro Stats & Logout */}
          <div className="shrink-0 border-t border-slate-100 p-2 space-y-1.5 dark:border-slate-800/80">
            {/* Horizontal Mini Stats Bar */}
            <div className="flex items-center justify-around rounded-lg border border-slate-100 bg-slate-50/80 py-1.5 px-2 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="text-center">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block leading-none">Avg</span>
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">76%</span>
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block leading-none">Rank</span>
                <span className="text-xs font-extrabold text-amber-500">#124</span>
              </div>
            </div>

            {/* Compact Logout Button */}
            <button
                onClick={handleLogout}
                className="group flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-all duration-150 hover:bg-rose-100 active:scale-[0.98] dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
            >
              <LogOut size={14} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>
  );
}