// AdminAllUsers.jsx — Admin page for managing all registered users.
// Features: stat cards, live search, status/verified filters, sortable table,
// user detail modal with full profile, ban user modal with reason + duration,
// unban action, toast notifications, and responsive mobile card layout.
// Data is mocked in adminAllUsersData.js — swap for API calls when ready.

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Users, UserCheck, UserPlus, ShieldCheck,
  Search, Filter, ChevronDown, ChevronUp, X,
  Eye, ShieldOff, Shield, CheckCircle, AlertTriangle,
  Mail, Calendar, BarChart2, Flame, Building, Briefcase,
  Download, RotateCcw,
} from "lucide-react";
import { allUsersData, banDurations, banReasonOptions } from "../../data/adminAllUsersData";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(str) {
  const diff = Date.now() - new Date(str).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-blue-400 to-indigo-500", "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",   "from-amber-400 to-orange-500",
  "from-purple-400 to-violet-500","from-cyan-400 to-sky-500",
];
function avatarColor(id) { return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length]; }

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    active:   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    inactive: "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400",
    banned:   "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${map[status] ?? map.inactive}`}>
      {status}
    </span>
  );
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronDown size={11} className="text-slate-300 dark:text-slate-600" />;
  return sortDir === "asc"
    ? <ChevronUp size={11} className="text-blue-500" />
    : <ChevronDown size={11} className="text-blue-500" />;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  const C = {
    blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",    icon: "text-blue-600 dark:text-blue-400",    border: "border-blue-100 dark:border-blue-800/40"    },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-800/40" },
    indigo:  { bg: "bg-indigo-50 dark:bg-indigo-900/20",  icon: "text-indigo-600 dark:text-indigo-400",  border: "border-indigo-100 dark:border-indigo-800/40"  },
    amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",   icon: "text-amber-600 dark:text-amber-400",   border: "border-amber-100 dark:border-amber-800/40"   },
  }[color];
  return (
    <div className={`bg-white dark:bg-slate-900 border ${C.border} rounded-xl p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${C.bg} shrink-0`}><Icon size={20} className={C.icon} /></div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────

function UserDetailModal({ user, onClose, onBan }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatarColor(user.id)} flex items-center justify-center text-white text-lg font-bold shrink-0`}>
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5"><Mail size={12} />{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <StatusBadge status={user.status} />
              {user.verified
                ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle size={10} />Verified</span>
                : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400"><AlertTriangle size={10} />Unverified</span>
              }
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { icon: Calendar,   label: "Joined",         value: formatDate(user.joinDate)   },
            { icon: Flame,      label: "Last Active",     value: daysSince(user.lastActive)  },
            { icon: Building,   label: "Target Company",  value: user.targetCompany           },
            { icon: Briefcase,  label: "Experience",      value: user.experience              },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} className="text-slate-400 dark:text-slate-500" />
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
              </div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{value}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Tests Done",  value: user.testsAttempted,  color: "text-blue-600 dark:text-blue-400"    },
            { label: "Avg Score",   value: `${user.avgScore}%`,  color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Streak",      value: `${user.streak}d`,    color: "text-amber-600 dark:text-amber-400"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
              <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to="/admin/users/results"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <BarChart2 size={14} /> View Results
          </Link>
          {user.status !== "banned" && (
            <button
              onClick={() => { onClose(); onBan(user); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm"
            >
              <ShieldOff size={14} /> Ban User
            </button>
          )}
          {user.status === "banned" && (
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
            >
              <RotateCcw size={14} /> Unban User
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Ban Modal ────────────────────────────────────────────────────────────────

function BanModal({ user, onConfirm, onClose }) {
  const [reason, setReason]     = useState("");
  const [duration, setDuration] = useState("permanent");
  const [note, setNote]         = useState("");
  const [error, setError]       = useState("");

  function handleSubmit() {
    if (!reason) { setError("Please select a ban reason."); return; }
    onConfirm({ userId: user.id, reason, duration, note });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 shrink-0">
            <ShieldOff size={22} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">Ban User</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.name} · {user.email}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Ban Reason <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {banReasonOptions.map((r) => (
              <button
                key={r}
                onClick={() => { setReason(r); setError(""); }}
                className={`px-3 py-2 rounded-lg text-[12px] font-medium text-left border transition-colors ${
                  reason === r
                    ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-rose-500 mt-2">{error}</p>}
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Duration</label>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {banDurations.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDuration(value)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  duration === value
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Internal Note (optional)</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context for other admins…"
            className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 resize-none transition-colors"
          />
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 mb-5">
          <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            This user will immediately lose access to the platform and receive a ban notification.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white transition-colors shadow-sm">
            Confirm Ban
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminAllUsers() {
  const [users, setUsers]             = useState(allUsersData);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all"); // "all" | "verified" | "unverified"
  const [sortField, setSortField]     = useState("joinDate");
  const [sortDir, setSortDir]         = useState("desc");
  const [viewUser, setViewUser]       = useState(null);
  const [banUser, setBanUser]         = useState(null);
  const [toast, setToast]             = useState(null);

  // ── derived stats ──────────────────────────────────────────────────────────
  const totalUsers    = users.length;
  const activeUsers   = users.filter((u) => u.status === "active").length;
  const thisMonth     = users.filter((u) => new Date(u.joinDate).getMonth() === new Date().getMonth()).length;
  const verifiedCount = users.filter((u) => u.verified).length;

  // ── filtering + sorting ────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let r = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || String(u.id).includes(q));
    }
    if (statusFilter !== "all")   r = r.filter((u) => u.status === statusFilter);
    if (verifiedFilter === "verified")   r = r.filter((u) => u.verified);
    if (verifiedFilter === "unverified") r = r.filter((u) => !u.verified);

    r.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === "joinDate" || sortField === "lastActive") { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [users, search, statusFilter, verifiedFilter, sortField, sortDir]);

  function handleSort(field) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  function handleBanConfirm({ userId }) {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "banned" } : u));
    setBanUser(null);
    showToast("User has been banned successfully.");
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const TH = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap select-none";
  const THSort = TH + " cursor-pointer hover:text-slate-700 dark:hover:text-slate-200";

  return (
    <div className="space-y-5 pb-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
            <Users size={22} className="text-blue-500" />
            All Users
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">View and manage every registered user on the platform</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm self-start sm:self-auto shrink-0">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Users"      value={totalUsers}    icon={Users}       color="blue"    />
        <StatCard label="Active Users"     value={activeUsers}   icon={UserCheck}   color="emerald" />
        <StatCard label="Joined This Month" value={thisMonth}    icon={UserPlus}    color="indigo"  />
        <StatCard label="Verified Accounts" value={verifiedCount} icon={ShieldCheck} color="amber"  />
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
            {["all", "active", "inactive", "banned"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Verified filter */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
            {[{ key: "all", label: "All" }, { key: "verified", label: "✓ Verified" }, { key: "unverified", label: "Unverified" }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setVerifiedFilter(key)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  verifiedFilter === key
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {(search || statusFilter !== "all" || verifiedFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                "{search}" <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                {statusFilter} <button onClick={() => setStatusFilter("all")}><X size={10} /></button>
              </span>
            )}
            {verifiedFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 capitalize">
                {verifiedFilter} <button onClick={() => setVerifiedFilter("all")}><X size={10} /></button>
              </span>
            )}
            <button onClick={() => { setSearch(""); setStatusFilter("all"); setVerifiedFilter("all"); }} className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{displayed.length}</span> of {totalUsers} users
      </p>

      {/* ── Table (desktop) ──────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-16 text-center shadow-sm">
          <Users size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No users found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className={THSort} onClick={() => handleSort("name")}>
                      <span className="flex items-center gap-1">User <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={THSort} onClick={() => handleSort("joinDate")}>
                      <span className="flex items-center gap-1">Joined <SortIcon field="joinDate" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={THSort} onClick={() => handleSort("lastActive")}>
                      <span className="flex items-center gap-1">Last Active <SortIcon field="lastActive" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={THSort} onClick={() => handleSort("testsAttempted")}>
                      <span className="flex items-center gap-1">Tests <SortIcon field="testsAttempted" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={THSort} onClick={() => handleSort("avgScore")}>
                      <span className="flex items-center gap-1">Avg Score <SortIcon field="avgScore" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={TH}>Verified</th>
                    <th className={TH}>Status</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {displayed.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor(user.id)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] truncate">{user.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(user.joinDate)}</td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{daysSince(user.lastActive)}</td>
                      <td className="px-4 py-3.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">{user.testsAttempted}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-bold ${user.avgScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : user.avgScore >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"}`}>
                            {user.avgScore}%
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden hidden xl:block">
                            <div
                              className={`h-full rounded-full ${user.avgScore >= 80 ? "bg-emerald-500" : user.avgScore >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                              style={{ width: `${user.avgScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {user.verified
                          ? <CheckCircle size={15} className="text-emerald-500" />
                          : <AlertTriangle size={15} className="text-amber-500" />
                        }
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={user.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewUser(user)}
                            title="View profile"
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          {user.status !== "banned" ? (
                            <button
                              onClick={() => setBanUser(user)}
                              title="Ban user"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                              <Shield size={12} /> Ban
                            </button>
                          ) : (
                            <span className="px-2.5 py-1.5 text-[12px] font-semibold text-slate-400 dark:text-slate-500">Banned</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Cards ─────────────────────────────────────────────── */}
          <div className="lg:hidden flex flex-col gap-3">
            {displayed.map((user) => (
              <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(user.id)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[14px] text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <StatusBadge status={user.status} />
                </div>
                <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[11px] text-slate-400">Tests</p>
                    <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{user.testsAttempted}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Score</p>
                    <p className={`text-[13px] font-bold ${user.avgScore >= 80 ? "text-emerald-600" : user.avgScore >= 60 ? "text-amber-600" : "text-rose-500"}`}>{user.avgScore}%</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Joined</p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{formatDate(user.joinDate)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setViewUser(user)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Eye size={13} /> View
                  </button>
                  {user.status !== "banned" && (
                    <button onClick={() => setBanUser(user)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors">
                      <Shield size={13} /> Ban
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} onBan={(u) => { setViewUser(null); setBanUser(u); }} />}
      {banUser  && <BanModal user={banUser} onConfirm={handleBanConfirm} onClose={() => setBanUser(null)} />}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium max-w-xs">
          <CheckCircle size={16} className="text-emerald-400 dark:text-emerald-600 shrink-0" />
          {toast.message}
        </div>
      )}
    </div>
  );
}
