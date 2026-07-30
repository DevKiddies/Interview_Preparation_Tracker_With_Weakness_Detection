// AdminBannedUsers.jsx — Admin page for viewing and managing banned user accounts.
// Features: stat cards, search, filter by ban type / reason, sortable table,
// user detail modal, unban confirmation dialog, and ban expiry indicators.
// Fetches live data from GET /api/admin/users/banned; unban calls the real endpoint.
// Note: reportCount is currently always 0 — there's no user-report/abuse-flagging
// feature in the app yet.

import { useState, useMemo, useEffect } from "react";
import {
  UserX, Search, Filter, ChevronDown, ChevronUp,
  Shield, ShieldOff, Clock, AlertTriangle, X,
  CheckCircle, Eye, RotateCcw, Mail,
  ClipboardList, BarChart2, Flag, Loader2, RefreshCw,
} from "lucide-react";
import { banReasons } from "../../data/adminBannedUsersData";
import API_BASE from "../../utils/api";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(id) {
  const palettes = [
    "from-blue-400 to-indigo-500",
    "from-rose-400 to-pink-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-purple-400 to-violet-500",
    "from-cyan-400 to-sky-500",
  ];
  // id is a UUID string (not a small int), so hash it into a deterministic index
  // instead of using % directly — "uuid" % n is NaN.
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return palettes[hash % palettes.length];
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    rose:    { bg: "bg-rose-50 dark:bg-rose-900/20",    icon: "text-rose-600 dark:text-rose-400",    border: "border-rose-100 dark:border-rose-800/40"    },
    amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",   icon: "text-amber-600 dark:text-amber-400",   border: "border-amber-100 dark:border-amber-800/40"   },
    indigo:  { bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-800/40" },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-800/40" },
  };
  const c = colors[color];
  return (
    <div className={`bg-white dark:bg-slate-900 border ${c.border} rounded-xl p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${c.bg} shrink-0`}>
        <Icon size={20} className={c.icon} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function BanTypeBadge({ type, daysRemaining }) {
  if (type === "permanent") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
        <Shield size={10} />
        Permanent
      </span>
    );
  }
  if (daysRemaining === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
        <Clock size={10} />
        Expired
      </span>
    );
  }
  const urgent = daysRemaining <= 5;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
      urgent
        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
    }`}>
      <Clock size={10} />
      {daysRemaining}d left
    </span>
  );
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronDown size={12} className="text-slate-300 dark:text-slate-600" />;
  return sortDir === "asc"
    ? <ChevronUp size={12} className="text-blue-500" />
    : <ChevronDown size={12} className="text-blue-500" />;
}

// ─── Unban Confirmation Modal ─────────────────────────────────────────────────

function UnbanModal({ user, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
            <ShieldOff size={28} className="text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">Unban this user?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{user.name}</span> will regain full access to the platform immediately.
            </p>
          </div>

          <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg px-4 py-3 text-left">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Ban reason on record</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{user.banReason}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(user.id)}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors shadow-sm"
            >
              Yes, Unban User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────

function UserDetailModal({ user, onClose, onUnban }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={18} />
        </button>

        {/* User Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-full bg-linear-to-br ${avatarColor(user.id)} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail size={12} />
              {user.email}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">User ID #{user.id}</p>
          </div>
        </div>

        {/* Ban Info */}
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 mb-5">
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-3">Ban Details</p>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Reason</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] mt-0.5">{user.banReason}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Type</p>
              <div className="mt-0.5">
                <BanTypeBadge type={user.banType} daysRemaining={user.daysRemaining} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Banned On</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] mt-0.5">{formatDate(user.bannedOn)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {user.banType === "permanent" ? "Expires" : "Expires On"}
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] mt-0.5">
                {user.expiresOn ? formatDate(user.expiresOn) : "Never"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Banned By</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] mt-0.5 truncate">{user.bannedBy}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Reports</p>
              <p className="font-semibold text-rose-700 dark:text-rose-400 text-[13px] mt-0.5">{user.reportCount} reports</p>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tests Attempted", value: user.testsAttempted, icon: ClipboardList, color: "text-blue-600 dark:text-blue-400" },
            { label: "Avg Score",       value: `${user.avgScore}%`, icon: BarChart2,    color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Prior Bans",      value: user.previousBans,   icon: Flag,         color: "text-rose-600 dark:text-rose-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <Icon size={16} className={`${color} mx-auto mb-1.5`} />
              <p className="text-base font-extrabold text-slate-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { onClose(); onUnban(user); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
          >
            <ShieldOff size={14} />
            Unban User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminBannedUsers() {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [filterType, setFilterType]     = useState("all");     // "all" | "permanent" | "temporary"
  const [filterReason, setFilterReason] = useState("All Reasons");
  const [sortField, setSortField]       = useState("bannedOn");
  const [sortDir, setSortDir]           = useState("desc");
  const [unbanTarget, setUnbanTarget]   = useState(null);      // user to unban
  const [viewTarget, setViewTarget]     = useState(null);      // user to view
  const [toast, setToast]               = useState(null);      // { message, type }
  const [reasonOpen, setReasonOpen]     = useState(false);
  const [refreshing, setRefreshing]     = useState(false);

  useEffect(() => {
    async function loadBannedUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/admin/users/banned`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        });
        if (!res.ok) throw new Error("Failed to load banned users");
        setUsers(await res.json());
      } catch (err) {
        setError(err.message || "Failed to load banned users");
      } finally {
        setLoading(false);
      }
    }
    loadBannedUsers();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/banned`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (!res.ok) throw new Error("Failed to load banned users");
      setUsers(await res.json());
    } catch (err) {
      setError(err.message || "Failed to load banned users");
    } finally {
      setRefreshing(false);
    }
  }

  // ── derived stats ──────────────────────────────────────────────────────────
  const totalBanned    = users.length;
  const permanentCount = users.filter((u) => u.banType === "permanent").length;
  const temporaryCount = users.filter((u) => u.banType === "temporary").length;

  // ── filtering + sorting ────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let result = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id).includes(q)
      );
    }
    if (filterType !== "all") result = result.filter((u) => u.banType === filterType);
    if (filterReason !== "All Reasons") result = result.filter((u) => u.banReason === filterReason);

    result.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === "bannedOn") { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, search, filterType, filterReason, sortField, sortDir]);

  // ── handlers ───────────────────────────────────────────────────────────────
  function handleSort(field) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  async function handleUnban(id) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/unban`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (!res.ok) throw new Error("Failed to unban user");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setUnbanTarget(null);
      showToast("User has been unbanned successfully.", "success");
    } catch (err) {
      showToast(err.message || "Failed to unban user", "error");
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const thClass = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <Loader2 size={22} className="animate-spin mr-2" /> Loading banned users…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/40 rounded-xl p-10 text-center shadow-sm">
        <AlertTriangle size={28} className="text-rose-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
            <UserX size={22} className="text-rose-500" />
            Banned Users
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage suspended accounts and review ban history
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm self-start sm:self-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Total Banned"    value={totalBanned}    icon={UserX}  color="rose"  />
        <StatCard label="Permanent Bans"  value={permanentCount} icon={Shield} color="rose"  />
        <StatCard label="Temporary Bans"  value={temporaryCount} icon={Clock}  color="amber" />
      </div>

      {/* ── Filters & Search ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email or user ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Ban Type Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 self-start sm:self-auto">
            {[
              { key: "all",       label: "All" },
              { key: "permanent", label: "Permanent" },
              { key: "temporary", label: "Temporary" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${
                  filterType === key
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Reason dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setReasonOpen((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors w-full sm:w-auto"
            >
              <Filter size={14} className="text-slate-400" />
              <span className="truncate max-w-35">
                {filterReason === "All Reasons" ? "Filter by Reason" : filterReason}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${reasonOpen ? "rotate-180" : ""}`} />
            </button>
            {reasonOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                {banReasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setFilterReason(r); setReasonOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                      filterReason === r
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter chips */}
        {(filterType !== "all" || filterReason !== "All Reasons" || search) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                Search: "{search}"
                <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {filterType !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)} bans
                <button onClick={() => setFilterType("all")}><X size={10} /></button>
              </span>
            )}
            {filterReason !== "All Reasons" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {filterReason}
                <button onClick={() => setFilterReason("All Reasons")}><X size={10} /></button>
              </span>
            )}
            <button
              onClick={() => { setSearch(""); setFilterType("all"); setFilterReason("All Reasons"); }}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline transition-colors ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Result count ─────────────────────────────────────────────────── */}
      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{displayed.length}</span> of {totalBanned} banned users
      </p>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-16 text-center shadow-sm">
          <CheckCircle size={36} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No results found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className={thClass} onClick={() => handleSort("name")}>
                      <span className="flex items-center gap-1">User <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={thClass}>Ban Reason</th>
                    <th className={thClass} onClick={() => handleSort("banType")}>
                      <span className="flex items-center gap-1">Type <SortIcon field="banType" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={thClass} onClick={() => handleSort("bannedOn")}>
                      <span className="flex items-center gap-1">Banned On <SortIcon field="bannedOn" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={thClass}>Expires On</th>
                    <th className={thClass} onClick={() => handleSort("reportCount")}>
                      <span className="flex items-center gap-1">Reports <SortIcon field="reportCount" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {displayed.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* User */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-linear-to-br ${avatarColor(user.id)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[13px]">{user.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-slate-600 dark:text-slate-400">{user.banReason}</span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <BanTypeBadge type={user.banType} daysRemaining={user.daysRemaining} />
                      </td>

                      {/* Banned On */}
                      <td className="px-4 py-3.5 text-[12px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(user.bannedOn)}
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3.5 text-[12px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {user.expiresOn ? formatDate(user.expiresOn) : <span className="text-rose-500 dark:text-rose-400 font-medium">Never</span>}
                      </td>

                      {/* Reports */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[12px] font-semibold ${user.reportCount >= 5 ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"}`}>
                          {user.reportCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewTarget(user)}
                            title="View details"
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setUnbanTarget(user)}
                            title="Unban user"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          >
                            <RotateCcw size={12} />
                            Unban
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {displayed.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br ${avatarColor(user.id)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-[14px] truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <BanTypeBadge type={user.banType} daysRemaining={user.daysRemaining} />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Reason</p>
                    <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">{user.banReason}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Banned On</p>
                    <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 mt-0.5">{formatDate(user.bannedOn)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Expires</p>
                    <p className="text-[12px] font-medium mt-0.5">
                      {user.expiresOn ? formatDate(user.expiresOn) : <span className="text-rose-500">Never</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Reports</p>
                    <p className={`text-[12px] font-bold mt-0.5 ${user.reportCount >= 5 ? "text-rose-600" : "text-slate-700 dark:text-slate-300"}`}>
                      {user.reportCount}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setViewTarget(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Eye size={13} /> View
                  </button>
                  <button
                    onClick={() => setUnbanTarget(user)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    <RotateCcw size={13} /> Unban
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Unban Modal ──────────────────────────────────────────────────── */}
      {unbanTarget && (
        <UnbanModal
          user={unbanTarget}
          onConfirm={handleUnban}
          onClose={() => setUnbanTarget(null)}
        />
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {viewTarget && (
        <UserDetailModal
          user={viewTarget}
          onClose={() => setViewTarget(null)}
          onUnban={(u) => setUnbanTarget(u)}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium max-w-xs animate-[slideUp_0.3s_ease]">
          <CheckCircle size={16} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          {toast.message}
        </div>
      )}

    </div>
  );
}
