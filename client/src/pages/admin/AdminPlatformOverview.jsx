// AdminPlatformOverview.jsx — Analytics & Reports > Platform Overview page.
// Comprehensive platform health dashboard: KPI tiles, user-growth area chart,
// topic-accuracy comparison, test-volume pie, and platform health metrics.

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, BarChart2, Target, CheckCircle,
  BookOpen, Activity, Download, Minus,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  monthlyGrowthData, platformKPIs, topicPerformanceData, platformHealthMetrics,
} from "../../data/adminAnalyticsData";

const RANGES = { "3M": 3, "6M": 6, "All": 12 };
const CHART_TABS = ["User Growth", "Tests Run", "Pass Rate"];

function TrendBadge({ trend }) {
  if (trend === 0) return <span className="inline-flex items-center gap-1 text-xs text-slate-400"><Minus size={11} />0%</span>;
  const up = trend > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? "text-green-600 dark:text-green-400" : "text-rose-500"}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}{trend}%
    </span>
  );
}

const KPI_META = {
  totalUsers:     { icon: Users,      color: "blue",   fmt: v => v.toLocaleString()    },
  totalTests:     { icon: Activity,   color: "indigo", fmt: v => v.toLocaleString()    },
  avgAccuracy:    { icon: Target,     color: "amber",  fmt: v => `${v}%`               },
  passRate:       { icon: CheckCircle,color: "green",  fmt: v => `${v}%`               },
  totalQuestions: { icon: BookOpen,   color: "teal",   fmt: v => v.toLocaleString()    },
  activeToday:    { icon: BarChart2,  color: "purple", fmt: v => v.toLocaleString()    },
};

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-xl shadow-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}{p.name?.includes("Rate") || p.name?.includes("Accuracy") ? "%" : ""}</strong></p>
      ))}
    </div>
  );
};

export default function AdminPlatformOverview() {
  const { isDark } = useTheme();
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const [range, setRange] = useState("All");
  const [chartTab, setChartTab] = useState("User Growth");
  const [toast, setToast] = useState(false);

  const slicedData = useMemo(() => {
    const n = RANGES[range];
    return monthlyGrowthData.slice(-n);
  }, [range]);

  const chartConfig = {
    "User Growth": { key: "newUsers",   color: "#3b82f6", label: "New Users",  gradient: "blue"   },
    "Tests Run":   { key: "testsRun",   color: "#6366f1", label: "Tests Run",  gradient: "indigo" },
    "Pass Rate":   { key: "passRate",   color: "#22c55e", label: "Pass Rate",  gradient: "green"  },
  };
  const cfg = chartConfig[chartTab];

  const handleExport = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const sortedTopicsByAccuracy = [...topicPerformanceData].sort((a, b) => a.avgAccuracy - b.avgAccuracy);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={26} /> Platform Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">End-to-end metrics across users, tests, and performance.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(platformKPIs).map(([key, data]) => {
          const { icon: Icon, color, fmt } = KPI_META[key];
          return (
            <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 w-fit mb-3`}>
                <Icon size={16} className={`text-${color}-600 dark:text-${color}-400`} />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fmt(data.value)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{data.label}</p>
              <div className="mt-2"><TrendBadge trend={data.trend} /></div>
            </div>
          );
        })}
      </div>

      {/* Main Area Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex gap-1 flex-wrap">
            {CHART_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${chartTab === tab ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {Object.keys(RANGES).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${range === r ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={slicedData}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => chartTab === "Pass Rate" ? `${v}%` : v} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Area
              type="monotone"
              dataKey={cfg.key}
              name={cfg.label}
              stroke={cfg.color}
              strokeWidth={2.5}
              fill="url(#chartGrad)"
              dot={false}
              activeDot={{ r: 5, fill: cfg.color }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Topic Accuracy Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">Avg Accuracy by Topic</h3>
          <p className="text-xs text-slate-400 mb-4">Sorted weakest to strongest</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sortedTopicsByAccuracy} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="topic" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`, "Avg Accuracy"]}
              />
              <Bar dataKey="avgAccuracy" radius={[0, 6, 6, 0]}>
                {sortedTopicsByAccuracy.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attempt Volume Pie */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">Test Attempts by Topic</h3>
          <p className="text-xs text-slate-400 mb-2">Distribution across all {topicPerformanceData.reduce((s, t) => s + t.attempts, 0).toLocaleString()} attempts</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={topicPerformanceData}
                dataKey="attempts"
                nameKey="topic"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {topicPerformanceData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [v.toLocaleString() + " attempts", n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
            {topicPerformanceData.map(d => (
              <div key={d.topic} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="truncate">{d.topic}</span>
                <span className="ml-auto font-medium text-slate-800 dark:text-slate-200">{d.attempts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-4">Platform Health</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {platformHealthMetrics.map(({ label, value, desc }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-white">{label}</span>
                  <p className="text-xs text-slate-400">{desc}</p>
                </div>
                <span className={`text-sm font-bold ${value >= 80 ? "text-green-600 dark:text-green-400" : value >= 60 ? "text-amber-600 dark:text-amber-400" : "text-rose-500"}`}>{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${value}%`, background: value >= 80 ? "#22c55e" : value >= 60 ? "#f59e0b" : "#ef4444" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Stats Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Topic Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {["Topic", "Attempts", "Avg Accuracy", "Pass Rate", "Status"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {[...topicPerformanceData].sort((a, b) => b.avgAccuracy - a.avgAccuracy).map(t => (
                <tr key={t.topic} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                      <span className="font-medium text-slate-900 dark:text-white">{t.topic}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{t.attempts.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                        <div className="h-1.5 rounded-full" style={{ width: `${t.avgAccuracy}%`, background: t.color }} />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t.avgAccuracy}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{t.passRate}%</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${t.avgAccuracy >= 70 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : t.avgAccuracy >= 60 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"}`}>
                      {t.avgAccuracy >= 70 ? "Good" : t.avgAccuracy >= 60 ? "Fair" : "Needs Work"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white bg-green-500">
          <Download size={15} /> Report exported successfully
        </div>
      )}
    </div>
  );
}
