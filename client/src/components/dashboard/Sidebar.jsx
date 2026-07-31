// Sidebar.jsx — Navigation panel (Desktop Sidebar + Mobile Bottom Nav & Drawer).
//
// Mobile bottom nav notes:
// - Rendered as a semantic <nav>, fixed to the viewport with `inset-x-0 bottom-0`
//   so it stays pinned regardless of page scroll position or page-level layout.
// - z-[60] keeps it above typical page content/modals in the z-40 range, and the
//   drawer overlay (z-[70]) still layers above it when open.
// - `env(safe-area-inset-bottom)` padding keeps it clear of the home-indicator
//   area on iOS devices with a notch/gesture bar.
// - Height is exported as MOBILE_NAV_HEIGHT so pages can reserve matching bottom
//   padding/margin and avoid content being hidden behind it — for consistent
//   layout across every page, wrap page content with something like:
//     <main style={{ paddingBottom: `calc(${MOBILE_NAV_HEIGHT} + env(safe-area-inset-bottom))` }} className="lg:pb-0">
//   (only needed below the lg breakpoint, since the bottom nav is desktop-hidden)

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import API_BASE from "../../utils/api.js";
import { getInterviewClosed } from "../../utils/interviewState";

const NAV_ITEMS = [
  { label: "Dashboard",  icon: LayoutDashboard, to: "/dashboard",           exact: true  },
  { label: "Mock Tests", icon: ClipboardList,   to: "/practice/mock-tests", exact: false },
  { label: "History",    icon: History,         to: "/interview-history",   exact: false },
  { label: "Profile",    icon: User,            to: "/profile/settings",    exact: false },
  { label: "Help Center",icon: HelpCircle,      to: "/help/faqs",           exact: false },
];

// Base row height (h-16 = 4rem). Pages should reserve at least this much
// bottom spacing (plus safe-area) so content never sits underneath the nav.
export const MOBILE_NAV_HEIGHT = "4rem";

export default function Sidebar({ username, targetLabel, experienceLabel, daysLeft }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("avatarUrl") || "");
  const [imgError, setImgError] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      localStorage.setItem("sidebarCollapsed", c ? "0" : "1");
      return !c;
    });
  };

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
  const hasInterview = !getInterviewClosed() && daysLeft !== null;

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
      <>
        {/* ========================================================================= */}
        {/* 1. DESKTOP SIDEBAR (Visible lg:block)                                     */}
        {/* ========================================================================= */}
        <aside className={`hidden shrink-0 transition-all duration-300 lg:block ${collapsed ? "w-16" : "w-64"}`}>
          <div className="sticky top-23 flex h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">

            {/* Inner Scrollable Wrapper */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">

              {/* User Profile & Progress Header */}
              <div className="shrink-0 space-y-2 border-b border-slate-100 p-2.5 dark:border-slate-800/80">
                {/* User Identity Row */}
                <div className={`flex items-center ${collapsed ? "flex-col gap-2" : "gap-2.5"}`}>
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

                  {!collapsed && (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold tracking-tight text-slate-900 dark:text-white">
                          {username || "User"}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] leading-tight text-slate-500 dark:text-slate-400">
                          <Sparkles size={10} className="shrink-0 text-indigo-500 dark:text-indigo-400" />
                          <span className="truncate">{subtitle}</span>
                        </div>
                      </div>
                  )}

                  <button
                      onClick={toggleCollapsed}
                      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                      className={`shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 ${
                          collapsed ? "" : "ml-auto"
                      }`}
                  >
                    {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                  </button>
                </div>

                {/* Compact Preparation Widget */}
                {!collapsed && hasInterview && (
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
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-500"
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
                )}
              </div>

              {/* Navigation Links */}
              <nav className="shrink-0 px-2 py-2">
                {!collapsed && (
                    <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Menu
                    </p>
                )}
                <ul className="space-y-0.5">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                        <li key={item.label}>
                          <Link
                              to={item.to}
                              title={collapsed ? item.label : undefined}
                              className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                                  collapsed ? "justify-center px-0" : ""
                              }`}
                          >
                            {active && (
                                <motion.div
                                    layoutId="active-nav-pill"
                                    className="absolute inset-0 rounded-lg bg-blue-600 shadow-sm shadow-blue-500/20"
                                    transition={{
                                      type: "spring",
                                      stiffness: 380,
                                      damping: 30,
                                    }}
                                />
                            )}

                            <motion.div
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative z-10 flex items-center justify-center"
                            >
                              <Icon
                                  size={16}
                                  className={`transition-colors duration-150 ${
                                      active
                                          ? "text-white"
                                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                                  }`}
                              />
                            </motion.div>

                            {!collapsed && (
                                <span
                                    className={`relative z-10 flex-1 transition-colors duration-150 ${
                                        active
                                            ? "text-white font-semibold"
                                            : "text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200"
                                    }`}
                                >
                            {item.label}
                          </span>
                            )}

                            {!collapsed && item.badge && (
                                <span
                                    className={`relative z-10 rounded-full px-1.5 py-0.2 text-[10px] font-bold transition-colors ${
                                        active
                                            ? "bg-white/20 text-white"
                                            : "bg-rose-500 text-white"
                                    }`}
                                >
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
              {!collapsed && hasInterview && (
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
              )}

              <button
                  onClick={handleLogout}
                  title={collapsed ? "Logout" : undefined}
                  className={`group flex w-full items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-all duration-150 hover:bg-rose-100 active:scale-[0.98] dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 ${
                      collapsed ? "p-1.5" : "gap-1.5 px-2.5 py-1.5 text-xs font-semibold"
                  }`}
              >
                <LogOut size={14} className="transition-transform duration-150 group-hover:-translate-x-0.5" />
                {!collapsed && <span>Logout</span>}
              </button>
            </div>

          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. MOBILE BOTTOM NAVIGATION BAR (Visible lg:hidden)                       */}
        {/* Fixed to the viewport, safe-area aware, consistent across every page.     */}
        {/* ========================================================================= */}
        <nav
            className="fixed inset-x-0 bottom-0 z-[60] flex h-16 items-center justify-around border-t border-slate-200 bg-white/90 px-2 backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-900/90"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
                <Link
                    key={item.label}
                    to={item.to}
                    className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                        active
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
            );
          })}
        </nav>
      </>
  );
}