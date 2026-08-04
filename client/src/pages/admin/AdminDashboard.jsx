// AdminDashboard.jsx — Admin overview dashboard showing platform-wide stats,
// user growth charts, question distribution, test completion trends, recent
// activity feed, and platform health metrics.
// All data is live: a single GET /api/admin/dashboard returns the stat cards
// plus every chart series, computed server-side from real persisted rows.

import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  UserCheck,
  BookOpen,
  ClipboardList,
  TrendingUp,
  UserX,
  PlusCircle,
  FilePlus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle,
  AlertCircle,
  Eye,
  Clock,
  Target,
  RefreshCw,
  Loader2,
  BarChart2,
  PieChart as PieIcon,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { TOPIC_COLORS } from "../../data/adminTestsData";
import API_BASE from "../../utils/api";

// ─── icon & color maps ────────────────────────────────────────────────────────

const ICON_MAP = {
  users: Users,
  "user-check": UserCheck,
  "book-open": BookOpen,
  "clipboard-list": ClipboardList,
  "trending-up": TrendingUp,
  "user-x": UserX,
  clock: Clock,
  check: CheckCircle,
  target: Target,
  repeat: RefreshCw,
};

const COLOR = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    border: "border-blue-100 dark:border-blue-800/40",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-100 dark:border-emerald-800/40",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    icon: "text-indigo-600 dark:text-indigo-400",
    badge:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-100 dark:border-indigo-800/40",
  },
  teal: {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    icon: "text-teal-600 dark:text-teal-400",
    badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
    border: "border-teal-100 dark:border-teal-800/40",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "text-amber-600 dark:text-amber-400",
    badge:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    border: "border-amber-100 dark:border-amber-800/40",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    icon: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    border: "border-rose-100 dark:border-rose-800/40",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "text-purple-600 dark:text-purple-400",
    badge:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    border: "border-purple-100 dark:border-purple-800/40",
  },
};

// Fallback palette for categories that don't match a TOPIC_COLORS key.
const FALLBACK_PIE_COLORS = [
  "#3b82f6",
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#a855f7",
  "#10b981",
  "#f43f5e",
  "#0ea5e9",
  "#84cc16",
  "#f97316",
];

// ─── sub-components ───────────────────────────────────────────────────────────

function ActivityStatusIcon({ status }) {
  if (status === "success")
    return (
      <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
    );
  if (status === "warning")
    return <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />;
  return <Activity size={14} className="text-blue-500 mt-0.5 shrink-0" />;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{ color: p.color }}
          className="font-medium leading-5"
        >
          {p.name}:{" "}
          <span className="font-bold">
            {typeof p.value === "number"
              ? p.value.toLocaleString()
              : p.value}
          </span>
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
      <p className="text-slate-500 dark:text-slate-400">
        {value.toLocaleString()} questions
      </p>
    </div>
  );
}

function EmptyChart({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon size={26} className="text-slate-300 dark:text-slate-700 mb-2" />
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[240px]">
        {message}
      </p>
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
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {stat.label}
        </p>
      </div>

      {stat.sublabel && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {stat.sublabel}
        </p>
      )}
    </div>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-5 gap-2">
        <div>
          <p className="text-[15px] font-bold text-slate-900 dark:text-white">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
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

// Segmented toggle reused by the activity chart (Growth/Daily Active) and the
// platform-health range picker.
function Segmented({ options, value, onChange, size = "sm" }) {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`${
            size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-3.5 py-1.5 text-xs"
          } font-semibold rounded-md transition-colors ${
            value === key
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { isDark } = useTheme();
  const [activityTab, setActivityTab] = useState("growth"); // "growth" | "dau"
  const [growthRange, setGrowthRange] = useState("All"); // "3M" | "6M" | "All"
  const [dauDays, setDauDays] = useState(7); // 7 | 14

  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to load dashboard");
      setDashboardStats(await res.json());
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load dashboard");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDashboard().finally(() => setLoading(false));
  }, [loadDashboard]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }

  const platformStats = dashboardStats
    ? [
        {
          id: "users",
          label: "Total Users",
          value: dashboardStats.totalUsers.toLocaleString(),
          icon: "users",
          color: "blue",
          change: "",
          changeDir: "up",
          sublabel: "",
        },
        {
          id: "questions",
          label: "Questions",
          value: dashboardStats.totalQuestions.toLocaleString(),
          icon: "book-open",
          color: "indigo",
          change: "",
          changeDir: "up",
          sublabel: "",
        },
        {
          id: "active-users",
          label: "Active Today",
          value: dashboardStats.totalUsersActiveToday.toLocaleString(),
          icon: "user-check",
          color: "emerald",
          change: "",
          changeDir: "up",
          sublabel: "",
        },
        {
          id: "tests",
          label: "Tests Taken",
          value: dashboardStats.totalTestsTaken.toLocaleString(),
          icon: "clipboard-list",
          color: "teal",
          change: "",
          changeDir: "up",
          sublabel: "",
        },
        {
          id: "avg-score",
          label: "Average Score",
          value: dashboardStats.averageScore.toFixed(1) + "%",
          icon: "trending-up",
          color: "amber",
          change: "",
          changeDir: "up",
          sublabel: "",
        },
        {
          id: "banned-users",
          label: "Banned Users",
          value: dashboardStats.bannedUsers.toLocaleString(),
          icon: "user-x",
          color: "rose",
          change: "",
          changeDir: "down",
          sublabel: "",
        },
        {
          id: "avg-session",
          label: "Avg Session",
          value: `${dashboardStats.averageSessionDuration.toFixed(2)} min`,
          icon: "clock",
          color: "purple",
          change: "",
          changeDir: "up",
          sublabel: "",
        },
        {
          id: "question-pass-rate",
          label: "Question Pass Rate",
          value: dashboardStats.questionPassRate.toFixed(2) + "%",
          icon: "check",
          color: "emerald",
          change: "",
          changeDir: "up",
          sublabel: "Correct answers across all attempted questions",
        },
      ]
    : [];

  // Chart data derived from the live payload.
  const growthData = useMemo(() => {
    if (!dashboardStats?.userGrowth) return [];
    const data = dashboardStats.userGrowth;
    const months = { "3M": 3, "6M": 6, All: 12 }[growthRange];
    return data.slice(-months);
  }, [dashboardStats, growthRange]);

  const dauData = useMemo(() => {
    if (!dashboardStats?.dailyActive) return [];
    return dashboardStats.dailyActive.slice(-dauDays);
  }, [dashboardStats, dauDays]);

  const questionsByCategory = useMemo(() => {
    if (!dashboardStats?.questionsByCategory) return [];
    return dashboardStats.questionsByCategory.map((c, i) => ({
      name: c.name,
      value: c.count,
      color: TOPIC_COLORS[c.name]
        ? TOPIC_COLORS[c.name].chart
        : FALLBACK_PIE_COLORS[i % FALLBACK_PIE_COLORS.length],
    }));
  }, [dashboardStats]);

  const testCompletion = useMemo(() => {
    if (!dashboardStats?.topicPerformance) return [];
    return dashboardStats.topicPerformance.map((t) => ({
      topic: t.topic,
      completed: t.attempts,
      avgScore: Math.round(t.avgAccuracy),
    }));
  }, [dashboardStats]);

  const recentActivity = dashboardStats?.recentActivity ?? [];
  const platformHealth = dashboardStats?.platformHealth;
  const totalQuestionCount =
    questionsByCategory.reduce((s, c) => s + c.value, 0) ||
    dashboardStats?.totalQuestions ||
    0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <Loader2 size={22} className="animate-spin mr-2" /> Loading dashboard…
      </div>
    );
  }

  if (error || !dashboardStats) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/40 rounded-xl p-10 text-center shadow-sm">
        <AlertCircle size={28} className="text-rose-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {error || "Failed to load dashboard"}
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Admin Dashboard
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
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

      {/* ── Charts Row 1: User Activity + Question Distribution ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User Activity Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between mb-5 gap-2">
            <div>
              <p className="text-[15px] font-bold text-slate-900 dark:text-white">
                User Activity
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activityTab === "growth"
                  ? "Cumulative & new user signups per month"
                  : "Users active per day (last_active_at)"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Segmented
                options={[
                  { key: "growth", label: "Growth" },
                  { key: "dau", label: "Daily Active" },
                ]}
                value={activityTab}
                onChange={setActivityTab}
              />
              {activityTab === "growth" ? (
                <Segmented
                  options={[
                    { key: "3M", label: "3M" },
                    { key: "6M", label: "6M" },
                    { key: "All", label: "All" },
                  ]}
                  value={growthRange}
                  onChange={setGrowthRange}
                />
              ) : (
                <Segmented
                  options={[
                    { key: 7, label: "7d" },
                    { key: 14, label: "14d" },
                  ]}
                  value={dauDays}
                  onChange={(k) => setDauDays(Number(k))}
                />
              )}
            </div>
          </div>

          {activityTab === "growth" ? (
            growthData.length === 0 ? (
              <EmptyChart
                icon={BarChart2}
                message="No user signups recorded yet — the growth trend will appear as users join."
              />
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart
                  data={growthData}
                  margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="totalUsers"
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
              </ResponsiveContainer>
            )
          ) : dauData.length === 0 ? (
            <EmptyChart
              icon={BarChart2}
              message="No login activity recorded yet — daily active counts appear once users log in."
            />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={dauData}
                margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="active"
                  name="Active Users"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Question Distribution Pie (1/3 width) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[15px] font-bold text-slate-900 dark:text-white">
              Questions by Category
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalQuestionCount.toLocaleString()} total questions
            </p>
          </div>
          {questionsByCategory.length === 0 ? (
            <EmptyChart
              icon={PieIcon}
              message="No questions in the bank yet — add questions to see the category breakdown."
            />
          ) : (
            <>
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
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-auto">
                      {cat.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Charts Row 2: Test Completion ────────────────────────────────────── */}
      <SectionCard
        title="Test Completion by Topic"
        subtitle="Total tests completed & average score per topic"
      >
        {testCompletion.length === 0 ? (
          <EmptyChart
            icon={BarChart2}
            message="No test attempts yet — topic performance will appear once users take tests."
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={testCompletion}
              margin={{ top: 4, right: 4, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="topic"
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: axisColor, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Bar
                dataKey="completed"
                name="Tests Completed"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="avgScore"
                name="Avg Score (%)"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* ── Platform Health ─────────────────────────────────────────────────── */}
      {platformHealth && (
        <SectionCard
          title="Platform Health"
          subtitle="Question coverage, onboarding & email verification rates"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                label: "Question Coverage",
                value: Math.round(platformHealth.questionCoverage),
                desc: "Topics with ≥3 questions",
              },
              {
                label: "User Onboarding",
                value: Math.round(platformHealth.onboardingRate),
                desc: "Users who completed onboarding",
              },
              {
                label: "Email Verification",
                value: Math.round(platformHealth.emailVerificationRate),
                desc: "Users with verified email",
              },
            ].map(({ label, value, desc }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-slate-800 dark:text-white">
                      {label}
                    </span>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      value >= 80
                        ? "text-green-600 dark:text-green-400"
                        : value >= 60
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-500"
                    }`}
                  >
                    {value}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${value}%`,
                      background:
                        value >= 80 ? "#22c55e" : value >= 60 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Recent Activity ──────────────────────────────────────────────── */}
      <SectionCard
        title="Recent Activity"
        subtitle="Latest signups, test attempts & bans across the platform"
        action={<ViewAllLink to="/admin/analytics" />}
      >
        {recentActivity.length === 0 ? (
          <EmptyChart
            icon={Activity}
            message="No activity yet — this feed fills in as users register and take tests."
          />
        ) : (
          <div className="flex flex-col divide-y divide-slate-50 dark:divide-slate-800/70">
            {recentActivity.map((item, idx) => (
              <div
                key={`${item.type}-${idx}`}
                className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
              >
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
        )}
      </SectionCard>
    </div>
  );
}
