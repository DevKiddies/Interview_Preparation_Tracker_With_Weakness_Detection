// AdminTestResults.jsx — Test Management > Test Results page.
// Shows aggregate stat cards, a score-distribution chart, an avg-accuracy-by-topic
// chart, and a filterable/sortable table of every persisted test attempt across
// every user, plus a per-attempt detail modal.
// Fetches live data from GET /api/admin/results — the same endpoint the admin
// "User Results" page uses. There's no persisted named-test concept server-side
// (users take ad-hoc question sets, not named tests) and no per-category
// breakdown is stored per attempt, so unlike the old mock this page has no
// fabricated test title column and no category-breakdown section in the modal.

import { useState, useMemo, useEffect } from "react";
import {
  BarChart2, Search, ChevronUp, ChevronDown, Eye, X,
  CheckCircle, XCircle, Clock, Target, Users, TrendingUp,
  Loader2, AlertTriangle, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { TOPIC_COLORS } from "../../data/adminTestsData";
import API_BASE from "../../utils/api";

const PAGE_SIZE = 10;

const SCORE_BUCKETS = [
  { label: "0–20%",   min: 0,  max: 20,  color: "#ef4444" },
  { label: "21–40%",  min: 21, max: 40,  color: "#f97316" },
  { label: "41–60%",  min: 41, max: 60,  color: "#f59e0b" },
  { label: "61–80%",  min: 61, max: 80,  color: "#3b82f6" },
  { label: "81–100%", min: 81, max: 100, color: "#22c55e" },
];

function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={13} className="text-slate-300 dark:text-slate-600" />;
  return dir === "asc" ? <ChevronUp size={13} className="text-blue-500" /> : <ChevronDown size={13} className="text-blue-500" />;
}

function TH({ label, sk, className = "", sortKey, sortDir, onSort }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap ${className}`} onClick={() => onSort(sk)}>
      <div className="flex items-center gap-1">{label}<SortIcon active={sortKey === sk} dir={sortDir} /></div>
    </th>
  );
}

function PassBadge({ passed }) {
  return passed
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"><CheckCircle size={10} />Pass</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 dark:bg-rose-900/30 text-rose-400"><XCircle size={10} />Fail</span>;
}

function TopicBadge({ topic }) {
  const c = TOPIC_COLORS[topic] || TOPIC_COLORS["DSA"];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{topic || "Unknown"}</span>;
}

function fmtTime(mins) {
  return `${mins} min`;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const AccuracyBar = ({ value }) => (
  <div className="flex items-center gap-2">
    <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
      <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, background: value >= 80 ? "#22c55e" : value >= 60 ? "#3b82f6" : value >= 40 ? "#f59e0b" : "#ef4444" }} />
    </div>
    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-10 text-right">{value.toFixed(1)}%</span>
  </div>
);

async function fetchResults() {
  const res = await fetch(`${API_BASE}/api/admin/results`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
  });
  if (!res.ok) throw new Error("Failed to load test results");
  return res.json();
}

export default function AdminTestResults() {
  const { isDark } = useTheme();
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("All");
  const [passFilter, setPassFilter] = useState("All"); // "All" | "Pass" | "Fail"
  const [scoreRange, setScoreRange] = useState("All"); // "All" | one of SCORE_BUCKETS.label
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        setResults(await fetchResults());
      } catch (err) {
        setError(err.message || "Failed to load test results");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      setResults(await fetchResults());
    } catch (err) {
      setError(err.message || "Failed to load test results");
    } finally {
      setRefreshing(false);
    }
  }

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  // Topic options come from the actual data rather than a hardcoded list, so
  // they can't drift out of sync with whatever category names are really in use.
  const topicOptions = useMemo(
    () => ["All", ...Array.from(new Set(results.map(r => r.topic).filter(Boolean)))],
    [results],
  );

  const filtered = useMemo(() => {
    let arr = [...results];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(a => a.userName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
    }
    if (topicFilter !== "All") arr = arr.filter(a => a.topic === topicFilter);
    if (passFilter === "Pass") arr = arr.filter(a => a.status === "pass");
    if (passFilter === "Fail") arr = arr.filter(a => a.status === "fail");
    if (scoreRange !== "All") {
      const bucket = SCORE_BUCKETS.find(b => b.label === scoreRange);
      if (bucket) arr = arr.filter(a => a.score >= bucket.min && a.score <= bucket.max);
    }
    arr.sort((a, b) => {
      let av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
      if (sortKey === "date") { av = new Date(av); bv = new Date(bv); }
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return arr;
  }, [results, search, topicFilter, passFilter, scoreRange, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    const total = results.length;
    const avgAcc = total ? (results.reduce((s, a) => s + a.score, 0) / total).toFixed(1) : 0;
    const passed = results.filter(a => a.status === "pass").length;
    const passRate = total ? ((passed / total) * 100).toFixed(1) : 0;
    const avgTime = total ? Math.round(results.reduce((s, a) => s + a.timeTaken, 0) / total) : 0;
    return { total, avgAcc, passRate, avgTime };
  }, [results]);

  // Score distribution chart data
  const scoreDistData = useMemo(() => SCORE_BUCKETS.map(b => ({
    label: b.label,
    count: results.filter(a => a.score >= b.min && a.score <= b.max).length,
    color: b.color,
  })), [results]);

  // Topic avg accuracy chart data
  const topicAvgData = useMemo(() => {
    const byTopic = new Map();
    results.forEach(a => {
      if (!a.topic) return;
      if (!byTopic.has(a.topic)) byTopic.set(a.topic, []);
      byTopic.get(a.topic).push(a.score);
    });
    return Array.from(byTopic.entries())
      .map(([topic, scores]) => ({
        topic,
        avg: Number((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)),
        color: (TOPIC_COLORS[topic] || TOPIC_COLORS["DSA"]).chart,
        attempts: scores.length,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [results]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <Loader2 size={22} className="animate-spin mr-2" /> Loading test results…
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="text-blue-500" size={26} /> Test Results
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of all user test submissions and performance metrics.</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm self-start sm:self-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Attempts", value: stats.total,            sub: "all time",           icon: Users,      color: "blue"   },
          { label: "Avg Accuracy",   value: `${stats.avgAcc}%`,     sub: "across all tests",   icon: Target,     color: "indigo" },
          { label: "Pass Rate",      value: `${stats.passRate}%`,   sub: "≥ 50% accuracy",     icon: TrendingUp, color: "green"  },
          { label: "Avg Time",       value: fmtTime(stats.avgTime), sub: "per attempt",        icon: Clock,      color: "amber"  },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 shrink-0`}>
              <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-16 text-center">
          <BarChart2 size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200">No test attempts yet</p>
          <p className="text-sm text-slate-500 mt-1">Results will appear here once users start taking tests.</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Score Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-4">Score Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={scoreDistData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: isDark ? "#e2e8f0" : "#1e293b", fontWeight: 600 }}
                    formatter={(v) => [`${v} attempt${v !== 1 ? "s" : ""}`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {scoreDistData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Topic Avg Accuracy */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-4">Avg Accuracy by Topic</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={topicAvgData} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} allowDecimals={false} />
                  <YAxis type="category" dataKey="topic" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
                  <Tooltip
                    contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: isDark ? "#e2e8f0" : "#1e293b", fontWeight: 600 }}
                    formatter={(v) => [`${v}%`, "Avg Accuracy"]}
                  />
                  <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                    {topicAvgData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by user name or email…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={topicFilter}
                onChange={e => { setTopicFilter(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {topicOptions.map(t => <option key={t} value={t}>{t === "All" ? "All Topics" : t}</option>)}
              </select>
            </div>

            {/* Score range pills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 self-center mr-1">Score:</span>
              {["All", ...SCORE_BUCKETS.map(b => b.label)].map(r => (
                <button key={r} onClick={() => { setScoreRange(r); setPage(1); }} className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${scoreRange === r ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>{r}</button>
              ))}
              <span className="text-slate-200 dark:text-slate-700 self-center">|</span>
              <span className="text-xs text-slate-400 self-center mr-1">Result:</span>
              {["All", "Pass", "Fail"].map(f => (
                <button key={f} onClick={() => { setPassFilter(f); setPage(1); }} className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${passFilter === f ? (f === "Fail" ? "bg-rose-600 text-white" : f === "Pass" ? "bg-green-600 text-white" : "bg-blue-600 text-white") : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}>{f}</button>
              ))}
            </div>

            <p className="text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <TH label="#" sk="id" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <TH label="User" sk="userName" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <TH label="Topic" sk="topic" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <TH label="Correct" sk="correct" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <TH label="Accuracy" sk="score" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <TH label="Time" sk="timeTaken" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <TH label="Date" sk="date" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Result</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {paginated.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400">No results match your filters</td></tr>
                  ) : paginated.map(attempt => (
                    <tr key={attempt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{attempt.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-white">{attempt.userName}</p>
                        <p className="text-xs text-slate-400">{attempt.email}</p>
                      </td>
                      <td className="px-4 py-3"><TopicBadge topic={attempt.topic} /></td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{attempt.correct}<span className="text-slate-400 font-normal">/{attempt.total}</span></td>
                      <td className="px-4 py-3"><AccuracyBar value={attempt.score} /></td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmtTime(attempt.timeTaken)}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{fmtDate(attempt.date)}</td>
                      <td className="px-4 py-3"><PassBadge passed={attempt.status === "pass"} /></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setModal(attempt)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Eye size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500">Page {page} of {totalPages} · {filtered.length} results</p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">Prev</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${page === p ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700">Next</button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {paginated.length === 0 && <p className="text-center text-slate-400 py-8">No results match your filters</p>}
            {paginated.map(attempt => (
              <div key={attempt.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{attempt.userName}</p>
                    <p className="text-xs text-slate-400">{attempt.email}</p>
                  </div>
                  <PassBadge passed={attempt.status === "pass"} />
                </div>
                <div className="flex gap-2"><TopicBadge topic={attempt.topic} /></div>
                <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">{attempt.correct}/{attempt.total}</span>
                  <span>·</span>
                  <span>{attempt.score.toFixed(1)}%</span>
                  <span>·</span>
                  <span><Clock size={11} className="inline" /> {fmtTime(attempt.timeTaken)}</span>
                </div>
                <AccuracyBar value={attempt.score} />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{fmtDate(attempt.date)}</span>
                  <button onClick={() => setModal(attempt)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Eye size={12} />View Details</button>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40">Prev</button>
                <span className="px-3 py-1.5 text-xs text-slate-500">{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40">Next</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Result Detail Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg">{modal.userName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{modal.email}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <TopicBadge topic={modal.topic} />
                </div>
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* Summary chips */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Correct",  value: `${modal.correct}/${modal.total}`, color: "blue"  },
                  { label: "Accuracy", value: `${modal.score.toFixed(1)}%`, color: modal.score >= 80 ? "green" : modal.score >= 60 ? "blue" : modal.score >= 40 ? "amber" : "rose" },
                  { label: "Time",     value: fmtTime(modal.timeTaken),        color: "indigo" },
                  { label: "Result",   value: modal.status === "pass" ? "Pass" : "Fail",  color: modal.status === "pass" ? "green" : "rose" },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`text-center p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-100 dark:border-${color}-800`}>
                    <p className={`text-base font-bold text-${color}-700 dark:text-${color}-300`}>{value}</p>
                    <p className={`text-xs text-${color}-500 dark:text-${color}-400 mt-0.5`}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Submitted at */}
              <p className="text-xs text-slate-400">Submitted: {new Date(modal.date).toLocaleString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>

            <div className="px-5 pb-5">
              <button onClick={() => setModal(null)} className="w-full py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
