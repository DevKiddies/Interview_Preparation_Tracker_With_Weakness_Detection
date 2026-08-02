// Sidebar.jsx — Navigation panel (Desktop Sidebar + Mobile Bottom Nav & Drawer).

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  User,
  HelpCircle,
  LogOut,
  Sparkles,
  History,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import API_BASE from "../../utils/api.js";
import { clearCachedProfile } from "../../utils/profileCache";

const NAV_ITEMS = [
  { label: "Dashboard",  icon: LayoutDashboard, to: "/dashboard",           exact: true  },
  { label: "Mock Tests", icon: ClipboardList,   to: "/practice/mock-tests", exact: false },
  { label: "History",    icon: History,         to: "/interview-history",   exact: false },
  { label: "Profile",    icon: User,            to: "/profile/settings",    exact: false },
  { label: "Help Center",icon: HelpCircle,      to: "/help/faqs",           exact: false },
];

export const MOBILE_NAV_HEIGHT = "4rem";

export default function Sidebar({ username, targetLabel, experienceLabel }) {
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
    clearCachedProfile();
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

              {/* User Profile Header */}
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

            {/* Footer Area with Compact Logout */}
            <div className="shrink-0 border-t border-slate-100 p-2 space-y-1.5 dark:border-slate-800/80">
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