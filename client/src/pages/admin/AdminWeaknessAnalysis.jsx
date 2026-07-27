// AdminWeaknessAnalysis.jsx — Analytics & Reports > Weakness Analysis page.
// The platform's signature feature: identifies where users struggle platform-wide.
// Shows a color-coded weakness heatmap, worst categories, most missed questions,
// topic-level weakness bar chart, and an accuracy improvement trend.

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine,
} from "recharts";
import {
  AlertTriangle, ChevronUp, ChevronDown, Info, TrendingUp,
  BookOpen, Target, Zap, HelpCircle,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  categoryWeaknessData, mostMissedQuestions, accuracyTrendData,
} from "../../data/adminAnalyticsData";
import { topicsConfig } from "../../data/adminQuestionsData";
import { TOPIC_COLORS } from "../../data/adminTestsData";

// Accuracy → color mapping used by the heatmap and table
function accColor(acc) {
  if (acc < 45) return { bg: "bg-rose-600",   text: "text-white",                  hex: "#dc2626", label: "Critical" };
  if (acc < 55) return { bg: "bg-rose-400",   text: "text-white",                  hex: "#f87171", label: "Weak"     };
  if (acc < 65) return { bg: "bg-amber-400",  text: "text-white",                  hex: "#fbbf24", label: "Fair"     };
  if (acc < 75) return { bg: "bg-blue-400",   text: "text-white",                  hex: "#60a5fa", label: "Good"     };
  return               { bg: "bg-green-500",  text: "text-white",                  hex: "#22c55e", label: "Strong"   };
}

function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={13} className="text-slate-300 dark:text-slate-600" />;
  return dir === "asc" ? <ChevronUp size={13} className="text-blue-500" /> : <ChevronDown size={13} className="text-blue-500" />;
}

const DIFF_COLORS = {
  Easy:   "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
  Medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  Hard:   "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};

export default function AdminWeaknessAnalysis() {
  const { isDark } = useTheme();
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const [sortKey, setSortKey] = useState("avgAccuracy");
  const [sortDir, setSortDir] = useState("asc");
  const [topicFilter, setTopicFilter] = useState("All");
  const [hoveredCell, setHoveredCell] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  // Topic-level avg accuracy (for the bar chart)
  const topicWeaknessData = useMemo(() => {
    return topicsConfig.map(tc => {
      const cats = categoryWeaknessData.filter(c => c.topic === tc.topic);
      const avg = cats.length ? (cats.reduce((s, c) => s + c.avgAccuracy, 0) / cats.length).toFixed(1) : 0;
      return { topic: tc.topic, avgAccuracy: Number(avg), color: TOPIC_COLORS[tc.topic]?.chart || "#64748b" };
    }).sort((a, b) => a.avgAccuracy - b.avgAccuracy); // weakest first
  }, []);

  const weakestTopic = topicWeaknessData[0];
  const weakestCategory = [...categoryWeaknessData].sort((a, b) => a.avgAccuracy - b.avgAccuracy)[0];
  const overallAvg = (categoryWeaknessData.reduce((s, c) => s + c.avgAccuracy, 0) / categoryWeaknessData.length).toFixed(1);
  const criticalCount = categoryWeaknessData.filter(c => c.avgAccuracy < 55).length;

  // Heatmap: grouped by topic, sorted by avgAccuracy within each group
  const heatmapData = useMemo(() => {
    return topicsConfig.map(tc => ({
      topic: tc.topic,
      categories: categoryWeaknessData
        .filter(c => c.topic === tc.topic)
        .sort((a, b) => a.avgAccuracy - b.avgAccuracy),
    }));
  }, []);

  // Category detail table (filterable + sortable)
  const filteredCategories = useMemo(() => {
    let arr = topicFilter === "All"
      ? [...categoryWeaknessData]
      : categoryWeaknessData.filter(c => c.topic === topicFilter);
    arr.sort((a, b) => {
      const av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return arr;
  }, [topicFilter, sortKey, sortDir]);

  const TH = ({ label, sk }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort(sk)}>
      <div className="flex items-center gap-1">{label}<SortIcon active={sortKey === sk} dir={sortDir} /></div>
    </th>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={26} /> Weakness Analysis
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Platform-wide detection of where users consistently underperform, powered by aggregated test attempt data.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 w-fit mb-3"><Zap size={16} className="text-rose-600 dark:text-rose-400" /></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Weakest Topic</p>
          <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{weakestTopic?.topic}</p>
          <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">{weakestTopic?.avgAccuracy}% avg</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30 w-fit mb-3"><Target size={16} className="text-rose-600 dark:text-rose-400" /></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Weakest Category</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 leading-tight">{weakestCategory?.category}</p>
          <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">{weakestCategory?.avgAccuracy}% avg</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 w-fit mb-3"><TrendingUp size={16} className="text-blue-600 dark:text-blue-400" /></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Platform Avg Accuracy</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{overallAvg}%</p>
          <p className="text-xs text-slate-400">across all categories</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 w-fit mb-3"><AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" /></div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Critical Weaknesses</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{criticalCount}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">categories below 55%</p>
        </div>
      </div>

      {/* Weakness Heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Weakness Heatmap</h3>
            <p className="text-xs text-slate-400 mt-0.5">Each cell = average accuracy for that category. Sorted weakest → strongest per topic.</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {[
              { label: "Critical",  color: "#dc2626" },
              { label: "Weak",      color: "#f87171" },
              { label: "Fair",      color: "#fbbf24" },
              { label: "Good",      color: "#60a5fa" },
              { label: "Strong",    color: "#22c55e" },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded" style={{ background: color }} />{label}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {heatmapData.map(({ topic, categories }) => {
            const tc = TOPIC_COLORS[topic];
            return (
              <div key={topic} className="flex items-start gap-3">
                <div className="w-24 shrink-0 pt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${tc?.bg} ${tc?.text}`}>{topic}</span>
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {categories.map(cat => {
                    const c = accColor(cat.avgAccuracy);
                    const cellId = `${topic}-${cat.category}`;
                    return (
                      <div
                        key={cat.category}
                        className={`relative px-2.5 py-1.5 rounded-lg text-xs font-semibold ${c.bg} ${c.text} cursor-default select-none transition-transform hover:scale-105`}
                        onMouseEnter={() => setHoveredCell(cellId)}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${cat.category}: ${cat.avgAccuracy}% avg · ${cat.attempts} attempts · ${cat.difficulty}`}
                      >
                        {cat.category}
                        <span className="ml-1.5 opacity-80">{cat.avgAccuracy}%</span>
                        {hoveredCell === cellId && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                            <p className="font-bold">{cat.category}</p>
                            <p>Accuracy: {cat.avgAccuracy}%</p>
                            <p>Attempts: {cat.attempts}</p>
                            <p>Difficulty: {cat.difficulty}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Topic weakness bar + Most missed questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Topic weakness bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">Topic Weakness Ranking</h3>
          <p className="text-xs text-slate-400 mb-4">Avg category accuracy per topic — weakest at top</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicWeaknessData} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="topic" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
              <ReferenceLine x={60} stroke={isDark ? "#334155" : "#e2e8f0"} strokeDasharray="4 4" label={{ value: "60%", fill: axisColor, fontSize: 10, position: "insideTopRight" }} />
              <Tooltip
                contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`, "Avg Accuracy"]}
              />
              <Bar dataKey="avgAccuracy" radius={[0, 6, 6, 0]}>
                {topicWeaknessData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most missed questions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={15} className="text-rose-500" />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Most Missed Questions</h3>
          </div>
          <div className="space-y-3">
            {mostMissedQuestions.map((q, idx) => {
              const tc = TOPIC_COLORS[q.topic];
              return (
                <div key={q.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                  <span className={`text-base font-bold min-w-[24px] ${q.correctRate < 40 ? "text-rose-500" : q.correctRate < 50 ? "text-amber-500" : "text-blue-500"}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">{q.text}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {tc && <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${tc.bg} ${tc.text}`}>{q.topic}</span>}
                      <span className="text-xs text-slate-400">{q.category}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${q.correctRate < 40 ? "text-rose-500" : q.correctRate < 50 ? "text-amber-500" : "text-blue-500"}`}>{q.correctRate}%</p>
                    <p className="text-xs text-slate-400">correct</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Accuracy Trend */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Platform Accuracy Trend</h3>
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
            <TrendingUp size={13} /> +13.7% over 12 months
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Overall avg accuracy across all categories per month — upward trend = improving</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={accuracyTrendData}>
            <defs>
              <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[55, 80]} tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "60% target", fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }} />
            <Tooltip
              contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v}%`, "Avg Accuracy"]}
            />
            <Line type="monotone" dataKey="avgAccuracy" name="Avg Accuracy" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: "#22c55e", r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Detail Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Category Breakdown</h3>
          <div className="flex gap-1 flex-wrap">
            {["All", ...topicsConfig.map(tc => tc.topic)].map(t => (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${topicFilter === t ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <TH label="Category"   sk="category"    />
                <TH label="Topic"      sk="topic"       />
                <TH label="Accuracy"   sk="avgAccuracy" />
                <TH label="Attempts"   sk="attempts"    />
                <TH label="Difficulty" sk="difficulty"  />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredCategories.map(cat => {
                const c = accColor(cat.avgAccuracy);
                const tc = TOPIC_COLORS[cat.topic];
                return (
                  <tr key={`${cat.topic}-${cat.category}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{cat.category}</td>
                    <td className="px-4 py-3">
                      {tc && <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tc.bg} ${tc.text}`}>{cat.topic}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${cat.avgAccuracy}%`, background: c.hex }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-white w-10">{cat.avgAccuracy}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{cat.attempts}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${DIFF_COLORS[cat.difficulty]}`}>{cat.difficulty}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 flex items-center gap-1"><Info size={11} />Sorted by accuracy ascending — most critical weaknesses appear first. Click column headers to re-sort.</p>
        </div>
      </div>
    </div>
  );
}
