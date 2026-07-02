// AdminUserResults.jsx — Admin page showing all user test results platform-wide.
// Features: stat cards, score distribution chart, topic performance chart,
// live search, topic/score/pass-fail filters, sortable results table,
// result detail modal, and responsive mobile card layout.
// Data is mocked in adminUserResultsData.js — swap for API calls when ready.

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  BarChart2, CheckCircle, XCircle, TrendingUp, Clock,
  Search, X, ChevronDown, ChevronUp, Eye, Download, Filter,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  userResultsData, topicOptions, scoreRangeOptions,
} from "../../data/adminUserResultsData";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDate(str) {
  return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const GRADIENTS = [
  "from-blue-400 to-indigo-500", "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",   "from-amber-400 to-orange-500",
  "from-purple-400 to-violet-500","from-cyan-400 to-sky-500",
];
function avatarColor(id) { return GRADIENTS[id % GRADIENTS.length]; }

function scoreColor(s) {
  if (s >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (s >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-500 dark:text-rose-400";
}
function scoreBg(s) {
  if (s >= 80) return "bg-emerald-500";
  if (s >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }) {
  const C = {
    blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",    icon: "text-blue-600 dark:text-blue-400",    border: "border-blue-100 dark:border-blue-800/40"    },
    emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-800/40" },
    amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",   icon: "text-amber-600 dark:text-amber-400",   border: "border-amber-100 dark:border-amber-800/40"   },
    indigo:  { bg: "bg-indigo-50 dark:bg-indigo-900/20", icon: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-800/40" },
  }[color];
  return (
    <div className={`bg-white dark:bg-slate-900 border ${C.border} rounded-xl p-4 flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${C.bg} shrink-0`}><Icon size={20} className={C.icon} /></div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronDown size={11} className="text-slate-300 dark:text-slate-600" />;
  return sortDir === "asc" ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />;
}

// ─── Result Detail Modal ──────────────────────────────────────────────────────

function ResultDetailModal({ result, onClose }) {
  const passed = result.status === "pass";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(result.userId)} flex items-center justify-center text-white text-base font-bold shrink-0`}>
            {getInitials(result.userName)}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{result.userName}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{result.email}</p>
          </div>
        </div>

        {/* Test name + topic */}
        <div className="mb-5">
          <p className="text-[15px] font-bold text-slate-900 dark:text-white">{result.testName}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            {result.topic}
          </span>
        </div>

        {/* Score ring-like display */}
        <div className={`rounded-xl p-5 mb-5 text-center ${passed ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40" : "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40"}`}>
          <p className={`text-5xl font-extrabold tracking-tight ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {result.score}%
          </p>
          <p className="text-sm font-semibold mt-1 text-slate-600 dark:text-slate-400">
            {result.correct} / {result.total} correct
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${passed ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${result.score}%` }} />
          </div>
          <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold ${passed ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400"}`}>
            {passed ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {passed ? "PASSED" : "FAILED"}
          </span>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Time Taken",     value: `${result.timeTaken} min` },
            { label: "Test Date",      value: formatDate(result.date)  },
            { label: "Total Questions",value: result.total             },
            { label: "Wrong Answers",  value: result.total - result.correct },
          ].map(({ label, value }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{label}</p>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminUserResults() {
  const { isDark } = useTheme();
  const [search, setSearch]       = useState("");
  const [topic, setTopic]         = useState("All Topics");
  const [scoreRange, setScoreRange] = useState("all");
  const [passFilter, setPassFilter] = useState("all"); // "all" | "pass" | "fail"
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir]     = useState("desc");
  const [viewResult, setViewResult] = useState(null);
  const [topicDropOpen, setTopicDropOpen] = useState(false);

  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  // ── derived stats ──────────────────────────────────────────────────────────
  const totalTests  = userResultsData.length;
  const avgScore    = Math.round(userResultsData.reduce((s, r) => s + r.score, 0) / totalTests);
  const passCount   = userResultsData.filter((r) => r.status === "pass").length;
  const passRate    = Math.round((passCount / totalTests) * 100);
  const todayTests  = userResultsData.filter((r) => r.date === new Date().toISOString().slice(0, 10)).length;

  // ── score distribution chart data ─────────────────────────────────────────
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: "0–20%",  min: 0,  max: 20,  count: 0 },
      { range: "21–40%", min: 21, max: 40,  count: 0 },
      { range: "41–60%", min: 41, max: 60,  count: 0 },
      { range: "61–80%", min: 61, max: 80,  count: 0 },
      { range: "81–100%",min: 81, max: 100, count: 0 },
    ];
    userResultsData.forEach((r) => {
      const b = buckets.find((b) => r.score >= b.min && r.score <= b.max);
      if (b) b.count++;
    });
    return buckets;
  }, []);

  // ── topic avg score chart data ────────────────────────────────────────────
  const topicPerformance = useMemo(() => {
    const map = {};
    userResultsData.forEach((r) => {
      if (!map[r.topic]) map[r.topic] = { total: 0, count: 0 };
      map[r.topic].total += r.score;
      map[r.topic].count++;
    });
    return Object.entries(map).map(([topic, { total, count }]) => ({
      topic: topic.replace("Data Structures", "DSA"),
      avgScore: Math.round(total / count),
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, []);

  // ── filtering + sorting ────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let r = [...userResultsData];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((u) => u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.testName.toLowerCase().includes(q));
    }
    if (topic !== "All Topics") r = r.filter((u) => u.topic === topic);
    if (passFilter !== "all")   r = r.filter((u) => u.status === passFilter);
    if (scoreRange === "high")   r = r.filter((u) => u.score >= 80);
    if (scoreRange === "medium") r = r.filter((u) => u.score >= 50 && u.score < 80);
    if (scoreRange === "low")    r = r.filter((u) => u.score < 50);

    r.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === "date") { av = new Date(av); bv = new Date(bv); }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [search, topic, passFilter, scoreRange, sortField, sortDir]);

  function handleSort(field) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  const TH = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap select-none";
  const THSort = TH + " cursor-pointer hover:text-slate-700 dark:hover:text-slate-200";

  // bucket colors for score distribution
  const bucketColors = ["#f43f5e", "#f97316", "#f59e0b", "#10b981", "#3b82f6"];

  return (
    <div className="space-y-5 pb-6">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-2">
            <BarChart2 size={22} className="text-indigo-500" />
            User Results
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">All test results across every user on the platform</p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm self-start sm:self-auto shrink-0">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Tests Taken"  value={totalTests}   icon={BarChart2}  color="blue"    />
        <StatCard label="Platform Avg Score" value={`${avgScore}%`} icon={TrendingUp} color="emerald" />
        <StatCard label="Pass Rate"          value={`${passRate}%`} icon={CheckCircle} color="indigo" sub={`${passCount} of ${totalTests} passed`} />
        <StatCard label="Tests Today"        value={todayTests}   icon={Clock}      color="amber"   />
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Score Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">Score Distribution</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">How many users fall in each score bracket</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreDistribution} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="range" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Tests" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {scoreDistribution.map((_, i) => <Cell key={i} fill={bucketColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Avg Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">Avg Score by Topic</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Mean score across all tests per subject</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={topicPerformance} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="topic" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="avgScore" name="Avg Score %" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user, email or test name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
          </div>

          {/* Topic dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setTopicDropOpen((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter size={14} className="text-slate-400" />
              {topic}
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${topicDropOpen ? "rotate-180" : ""}`} />
            </button>
            {topicDropOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1">
                {topicOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); setTopicDropOpen(false); }}
                    className={`w-full px-4 py-2.5 text-left text-[13px] transition-colors ${
                      topic === t
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >{t}</button>
                ))}
              </div>
            )}
          </div>

          {/* Score range pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
            {scoreRangeOptions.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setScoreRange(value)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  scoreRange === value
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >{label}</button>
            ))}
          </div>

          {/* Pass/Fail pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
            {[
              { key: "all",  label: "All"  },
              { key: "pass", label: "✓ Pass" },
              { key: "fail", label: "✗ Fail" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPassFilter(key)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  passFilter === key
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Active chips */}
        {(search || topic !== "All Topics" || scoreRange !== "all" || passFilter !== "all") && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">Active filters:</span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                "{search}" <button onClick={() => setSearch("")}><X size={10} /></button>
              </span>
            )}
            {topic !== "All Topics" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                {topic} <button onClick={() => setTopic("All Topics")}><X size={10} /></button>
              </span>
            )}
            {scoreRange !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {scoreRangeOptions.find((o) => o.value === scoreRange)?.label}
                <button onClick={() => setScoreRange("all")}><X size={10} /></button>
              </span>
            )}
            {passFilter !== "all" && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${passFilter === "pass" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"}`}>
                {passFilter === "pass" ? "Passed" : "Failed"}
                <button onClick={() => setPassFilter("all")}><X size={10} /></button>
              </span>
            )}
            <button onClick={() => { setSearch(""); setTopic("All Topics"); setScoreRange("all"); setPassFilter("all"); }} className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{displayed.length}</span> of {totalTests} results
      </p>

      {/* ── Table (desktop) ──────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-16 text-center shadow-sm">
          <BarChart2 size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No results found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className={THSort} onClick={() => handleSort("userName")}>
                      <span className="flex items-center gap-1">User <SortIcon field="userName" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={TH}>Test / Topic</th>
                    <th className={THSort} onClick={() => handleSort("score")}>
                      <span className="flex items-center gap-1">Score <SortIcon field="score" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={TH}>Correct</th>
                    <th className={THSort} onClick={() => handleSort("timeTaken")}>
                      <span className="flex items-center gap-1">Time <SortIcon field="timeTaken" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={THSort} onClick={() => handleSort("date")}>
                      <span className="flex items-center gap-1">Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} /></span>
                    </th>
                    <th className={TH}>Status</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {displayed.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => setViewResult(res)}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor(res.userId)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                            {getInitials(res.userName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] truncate">{res.userName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{res.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]">{res.testName}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                          {res.topic}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[14px] font-extrabold ${scoreColor(res.score)}`}>{res.score}%</span>
                          <div className="w-14 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden hidden xl:block">
                            <div className={`h-full rounded-full ${scoreBg(res.score)}`} style={{ width: `${res.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-600 dark:text-slate-400">{res.correct}/{res.total}</td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{res.timeTaken} min</td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(res.date)}</td>
                      <td className="px-4 py-3.5">
                        {res.status === "pass"
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"><CheckCircle size={10} />Pass</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"><XCircle size={10} />Fail</span>
                        }
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile Cards ─────────────────────────────────────────────── */}
          <div className="lg:hidden flex flex-col gap-3">
            {displayed.map((res) => (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => setViewResult(res)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor(res.userId)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                      {getInitials(res.userName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-slate-800 dark:text-slate-200 truncate">{res.userName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{res.testName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xl font-extrabold ${scoreColor(res.score)}`}>{res.score}%</p>
                    {res.status === "pass"
                      ? <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">PASSED</span>
                      : <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">FAILED</span>
                    }
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold">{res.topic}</span>
                  <span>{res.correct}/{res.total} correct</span>
                  <span>{res.timeTaken} min</span>
                  <span>{formatDate(res.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Result Detail Modal ──────────────────────────────────────────── */}
      {viewResult && <ResultDetailModal result={viewResult} onClose={() => setViewResult(null)} />}
    </div>
  );
}
