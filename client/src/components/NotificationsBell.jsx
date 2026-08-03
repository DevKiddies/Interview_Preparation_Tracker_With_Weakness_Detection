// NotificationsBell.jsx — the bell icon in the navbar for logged-in users.
// Backed by GET /api/notifications (+ /unread-count, PATCH .../read, PATCH .../read-all).
// Notifications are created server-side by NotificationService whenever something
// notification-worthy happens elsewhere in the app (account verified, password
// changed, a mock test's results are ready, onboarding completed, ...).

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import API_BASE from "../utils/api.js";

const TYPE_META = {
  WELCOME: { icon: Sparkles, color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  SECURITY: { icon: ShieldAlert, color: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400" },
  ONBOARDING: { icon: CheckCircle2, color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
  TEST_RESULT: { icon: ClipboardCheck, color: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
};
const DEFAULT_TYPE_META = {
  icon: Bell,
  color: "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
};

function timeAgo(dateStr) {
  const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const POLL_INTERVAL_MS = 60000;

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  // Deliberately .then()-chained (not async/await) so the setState calls are
  // visibly nested inside promise callbacks rather than the function's own body —
  // keeps this safe to call directly from a useEffect (see poll effect below).
  const fetchUnreadCount = () => {
    const headers = authHeaders();
    if (!headers) return;
    fetch(`${API_BASE}/api/notifications/unread-count`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUnreadCount(data.count ?? 0);
      })
      .catch(() => {
        // silent — the badge just won't update this cycle
      });
  };

  const fetchNotifications = async () => {
    const headers = authHeaders();
    if (!headers) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, { headers });
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data);
      setLoaded(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    const headers = authHeaders();
    if (!headers || unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, { method: "PATCH", headers });
    } catch {
      // local state already optimistically updated; a stale unread count self-corrects on next poll
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      const headers = authHeaders();
      if (headers) {
        fetch(`${API_BASE}/api/notifications/${n.id}/read`, { method: "PATCH", headers }).catch(() => {});
      }
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative group" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800" />
        )}
      </button>

      {!open && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-white opacity-0 scale-95 shadow-lg transition-all duration-150 group-hover:opacity-100 group-hover:scale-100 z-40"
        >
          Notifications
        </span>
      )}

      <div
        className={`absolute right-0 top-full pt-2 transition-all duration-200 z-50 ${
          open
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="w-80 max-w-[90vw] bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && !loaded && (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={18} className="animate-spin text-slate-400" />
              </div>
            )}

            {!loading && error && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-10 px-4">
                Couldn't load notifications. Try again shortly.
              </p>
            )}

            {!loading && !error && loaded && notifications.length === 0 && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-10 px-4">
                You're all caught up — no notifications yet.
              </p>
            )}

            {!error &&
              notifications.map((n) => {
                const meta = TYPE_META[n.type] || DEFAULT_TYPE_META;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full flex items-start gap-3 text-left px-4 py-3 border-b border-slate-50 dark:border-slate-700/60 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${
                      !n.isRead ? "bg-blue-50/40 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${meta.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
