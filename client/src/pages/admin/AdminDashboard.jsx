// AdminDashboard.jsx — Admin overview dashboard showing platform-wide stats, user growth
// charts, question distribution, test completion trends, recent activity feed, top
// performers leaderboard, platform health metrics, and quick-action shortcuts.
// All data is currently mocked in adminDashboardData.js — swap for API calls when ready.

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, UserCheck, BookOpen, ClipboardList, TrendingUp, UserX,
  PlusCircle, FilePlus, BarChart2, ArrowUpRight, ArrowDownRight,
  Activity, CheckCircle, AlertCircle, Eye, Clock, Target,
  RefreshCw, Award,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  platformStats,
  userGrowthData,
  dailyActiveUsers,
  questionsByCategory,
  weeklyTestCompletion,
  recentActivity,
  topUsers,
  platformHealthMetrics,
} from "../../data/adminDashboardData";

// ─── icon & color maps ────────────────────────────────────────────────────────

const ICON_MAP = {
  users:          Users,
  "user-check":   UserCheck,
  "book-open":    BookOpen,
  "clipboard-list": ClipboardList,
  "trending-up":  TrendingUp,
  "user-x":       UserX,
  clock:          Clock,
  check:          CheckCircle,
  target:         Target,
  repeat:         RefreshCw,
};

const COLOR = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",    icon: "text-blue-600 dark:text-blue-400",    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",    border: "border-blue-100 dark:border-blue-800/40"    },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", border: "border-emerald-100 dark:border-emerald-800/40" },
  indigo:  { bg: "bg-indigo-50 dark:bg-indigo-900/20",  icon: "text-indigo-600 dark:text-indigo-400",  badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",  border: "border-indigo-100 dark:border-indigo-800/40"  },
  teal:    { bg: "bg-teal-50 dark:bg-teal-900/20",    icon: "text-teal-600 dark:text-teal-400",    badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",    border: "border-teal-100 dark:border-teal-800/40"    },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",   icon: "text-amber-600 dark:text-amber-400",   badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",   border: "border-amber-100 dark:border-amber-800/40"   },
  rose:    { bg: "bg-rose-50 dark:bg-rose-900/20",    icon: "text-rose-600 dark:text-rose-400",    badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",    border: "border-rose-100 dark:border-rose-800/40"    },
  purple:  { bg: "bg-purple-50 dark:bg-purple-900/20",  icon: "text-purple-600 dark:text-purple-400",  badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",  border: "border-purple-100 dark:border-purple-800/40"  },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function ActivityStatusIcon({ status }) {
  if (status === "success") return <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />;
  if (status === "warning") return <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />;
  return <Activity size={14} className="text-blue-500 mt-0.5 shrink-0" />;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium leading-5">
          {p.name}:{" "}
          <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{name}</p>
      <p className="text-slate-500 dark:text-slate-400">{value} questions</p>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = ICON_MAP[stat.icon];
  const c = COLOR[stat.color];
  const isNegativeStat = stat.id === "banned-users";
  const isUp = stat.changeDir === "up";
  const badgePositive = isNegativeStat ? !isUp : isUp;

  return (
    <div
      className={`bg-white dark:bg-slate-900 border ${c.border} rounded-xl p-4 xl:p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`p-2.5 rounded-lg ${c.bg} shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <span
          className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
            badgePositive
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {stat.change}
        </span>
      </div>

      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
          {stat.value}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">{stat.sublabel}</p>
    </div>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-5 gap-2">
        <div>
          <p className="text-[15px] font-bold text-slate-900 dark:text-white">{title}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ViewAllLink({ to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors shrink-0"
    >
      View all
      <Eye size={11} />
    </Link>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const [activityTab, setActivityTab] = useState("growth"); // "growth" | "dau"

  const axisColor  = isDark ? "#64748b" : "#94a3b8";
  const gridColor  = isDark ? "#1e293b" : "#f1f5f9";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // rank badge style
  const rankStyle = (rank) => {
    if (rank === 1) return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    if (rank === 2) return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
    if (rank === 3) return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
    return "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500";
  };

  return (
    <div className="space-y-5 pb-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Admin Dashboard
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/questions/add"
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors shadow-sm"
          >
            <PlusCircle size={14} />
            Add Question
          </Link>
          <Link
            to="/admin/tests/create"
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <FilePlus size={14} />
            Create Test
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {platformStats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* ── Platform Health ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {platformHealthMetrics.map((metric) => {
          const Icon = ICON_MAP[metric.icon];
          const c = COLOR[metric.color];
          return (
            <div
              key={metric.label}
              className={`flex items-center gap-3 bg-white dark:bg-slate-900 border ${c.border} rounded-xl px-4 py-3 shadow-sm`}
            >
              <div className={`p-2 rounded-lg ${c.bg} shrink-0`}>
                <Icon size={15} className={c.icon} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-extrabold text-slate-900 dark:text-white leading-none">{metric.value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Charts Row 1: User Activity + Question Distribution ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* User Activity Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-5 gap-2">
            <div>
              <p className="text-[15px] font-bold text-slate-900 dark:text-white">User Activity</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Platform engagement overview</p>
            </div>
            {/* Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
              {[
                { key: "growth", label: "Growth" },
                { key: "dau",    label: "Daily Active" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActivityTab(key)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                    activityTab === key
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={230}>
            {activityTab === "growth" ? (
              <AreaChart data={userGrowthData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Total Users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#gTotal)"
                  dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  name="New Users"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#gNew)"
                  dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={dailyActiveUsers} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="day" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="dau" name="Active Users" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Question Distribution Pie (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[15px] font-bold text-slate-900 dark:text-white">Questions by Category</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">2,156 total questions</p>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={questionsByCategory}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={2}
                dataKey="value"
              >
                {questionsByCategory.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {questionsByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Test Completion ────────────────────────────────────── */}
      <SectionCard
        title="Test Completion by Topic"
        subtitle="Total tests completed & average score per subject"
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyTestCompletion} margin={{ top: 4, right: 4, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="topic" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Bar dataKey="completed" name="Tests Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={36} />
            <Bar dataKey="avgScore"  name="Avg Score (%)"   fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ── Bottom Row: Activity Feed + Leaderboard ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Activity */}
        <SectionCard
          title="Recent Activity"
          subtitle="Latest events across the platform"
          action={<ViewAllLink to="/admin/analytics" />}
        >
          <div className="flex flex-col divide-y divide-slate-50 dark:divide-slate-800/70">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <ActivityStatusIcon status={item.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-snug truncate">
                    {item.message}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                    {item.detail}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 pt-0.5">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Top Performers Leaderboard */}
        <SectionCard
          title="Top Performers"
          subtitle="Highest scoring users this month"
          action={<ViewAllLink to="/admin/users" />}
        >
          <div className="flex flex-col gap-1.5">
            {topUsers.map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
              >
                {/* Rank badge */}
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${rankStyle(user.rank)}`}
                >
                  {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : user.rank}
                </span>

                {/* Avatar initial */}
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">Tests</p>
                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mt-0.5">{user.tests}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">Streak</p>
                    <p className="text-[13px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">{user.streak}d</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">Score</p>
                    <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{user.score}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Question",  icon: PlusCircle, to: "/admin/questions/add",  color: "blue"    },
            { label: "Create Test",   icon: FilePlus,   to: "/admin/tests/create",   color: "indigo"  },
            { label: "Manage Users",  icon: Users,      to: "/admin/users",          color: "teal"    },
            { label: "Analytics",     icon: BarChart2,  to: "/admin/analytics",      color: "amber"   },
          ].map(({ label, icon: Icon, to, color }) => {
            const c = COLOR[color];
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${c.bg} ${c.border}`}
              >
                <div className={`p-2.5 rounded-lg bg-white/60 dark:bg-slate-900/40`}>
                  <Icon size={18} className={c.icon} />
                </div>
                <span className={`text-[12px] font-semibold text-center leading-tight ${c.icon}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 pt-1">
        All data is currently mocked — connect backend API to enable live stats.
      </p>

    </div>
  );
}
