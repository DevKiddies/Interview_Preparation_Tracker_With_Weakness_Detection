// AdminCategoriesTopics.jsx — Admin page for managing question categories and topics.
// Shows a card per topic with question counts, difficulty distribution bar, and
// category chips. Includes an "Add Category" modal, rename/delete category actions,
// and a horizontal bar chart of questions per topic using Recharts.
// Data derived from adminQuestionsData.js — wire to API when ready.

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  FolderOpen, PlusCircle, Pencil, Trash2, X, CheckCircle,
  AlertTriangle, Database, Tag, BookOpen, ArrowRight,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { questionsData, topicsConfig, difficultyLevels } from "../../data/adminQuestionsData";

// ─── colour maps ─────────────────────────────────────────────────────────────
const TOPIC_COLORS = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",    border: "border-blue-200 dark:border-blue-800/50", badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", icon: "text-blue-600 dark:text-blue-400", chart: "#3b82f6" },
  indigo:  { bg: "bg-indigo-50 dark:bg-indigo-900/20",  border: "border-indigo-200 dark:border-indigo-800/50", badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400", icon: "text-indigo-600 dark:text-indigo-400", chart: "#6366f1" },
  teal:    { bg: "bg-teal-50 dark:bg-teal-900/20",    border: "border-teal-200 dark:border-teal-800/50",   badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400", icon: "text-teal-600 dark:text-teal-400", chart: "#14b8a6" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-200 dark:border-amber-800/50",  badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400", icon: "text-amber-600 dark:text-amber-400", chart: "#f59e0b" },
  purple:  { bg: "bg-purple-50 dark:bg-purple-900/20",  border: "border-purple-200 dark:border-purple-800/50", badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400", icon: "text-purple-600 dark:text-purple-400", chart: "#a855f7" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", icon: "text-emerald-600 dark:text-emerald-400", chart: "#10b981" },
};

const DIFF_COLORS = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: <span className="font-bold">{p.value}</span></p>)}
    </div>
  );
}

// ─── Add Category Modal ───────────────────────────────────────────────────────
function AddCategoryModal({ topic, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [err, setErr]   = useState("");

  function handleSubmit() {
    if (!name.trim()) { setErr("Category name is required."); return; }
    if (name.trim().length < 2) { setErr("Name must be at least 2 characters."); return; }
    onAdd(topic, name.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 shrink-0"><Tag size={18} className="text-blue-600 dark:text-blue-400" /></div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Add Category</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Topic: {topic}</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category Name <span className="text-rose-500">*</span></label>
          <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="e.g. Advanced Trees"
            className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          {err && <p className="text-[11px] text-rose-500 mt-1">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">Add Category</button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Category Confirm ──────────────────────────────────────────────────
function DeleteCategoryModal({ topic, category, count, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-900/20 w-fit mx-auto mb-4"><Trash2 size={22} className="text-rose-600 dark:text-rose-400" /></div>
        <p className="font-bold text-slate-900 dark:text-white mb-1">Delete "{category}"?</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">From topic: {topic}</p>
        {count > 0 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg mb-4 text-left">
            <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{count} question{count > 1 ? "s are" : " is"} tagged with this category. They will become uncategorised.</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Topic Card ───────────────────────────────────────────────────────────────
function TopicCard({ cfg, questions, categories, onAddCategory, onDeleteCategory }) {
  const c = TOPIC_COLORS[cfg.color];
  const topicQs = questions.filter((q) => q.topic === cfg.topic);
  const total   = topicQs.length;

  const diffCounts = useMemo(() => {
    const map = {};
    difficultyLevels.forEach((d) => { map[d] = topicQs.filter((q) => q.difficulty === d).length; });
    return map;
  }, [topicQs]);

  const catCounts = useMemo(() => {
    const map = {};
    categories.forEach((cat) => { map[cat] = topicQs.filter((q) => q.category === cat).length; });
    return map;
  }, [topicQs, categories]);

  return (
    <div className={`bg-white dark:bg-slate-900 border ${c.border} rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow duration-200`}>
      {/* Topic header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${c.bg}`}>
            <BookOpen size={18} className={c.icon} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{cfg.topic}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{cfg.label}</p>
          </div>
        </div>
        <span className={`text-lg font-extrabold ${c.icon} shrink-0`}>{total}</span>
      </div>

      {/* Difficulty distribution */}
      <div>
        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Difficulty Split</p>
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {difficultyLevels.map((d) => {
            const pct = total ? (diffCounts[d] / total) * 100 : 0;
            return pct > 0 ? (
              <div key={d} style={{ width: `${pct}%`, background: DIFF_COLORS[d] }} title={`${d}: ${diffCounts[d]}`} />
            ) : null;
          })}
          {total === 0 && <div className="w-full bg-slate-100 dark:bg-slate-800" />}
        </div>
        <div className="flex gap-3 mt-1.5">
          {difficultyLevels.map((d) => (
            <span key={d} className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: DIFF_COLORS[d] }} />
              {d} ({diffCounts[d]})
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Categories</p>
          <button onClick={() => onAddCategory(cfg.topic)}
            className={`text-[10px] font-semibold flex items-center gap-1 ${c.icon} hover:opacity-80 transition-opacity`}>
            <PlusCircle size={11} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <div key={cat} className="group relative">
              <span className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-medium ${c.badge}`}>
                {cat}
                {catCounts[cat] > 0 && <span className="opacity-60">({catCounts[cat]})</span>}
                <button
                  onClick={() => onDeleteCategory(cfg.topic, cat, catCounts[cat] ?? 0)}
                  className="opacity-0 group-hover:opacity-100 ml-0.5 hover:text-rose-600 transition-all rounded-full"
                  title="Remove category"
                >
                  <X size={10} />
                </button>
              </span>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No categories yet</p>
          )}
        </div>
      </div>

      {/* Footer link */}
      <Link
        to={`/admin/questions?topic=${encodeURIComponent(cfg.topic)}`}
        className={`flex items-center justify-between text-[12px] font-semibold ${c.icon} hover:opacity-80 transition-opacity pt-2 border-t ${c.border}`}
      >
        <span>View {total} question{total !== 1 ? "s" : ""} in bank</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AdminCategoriesTopics() {
  const { isDark } = useTheme();
  const [topics, setTopics] = useState(
    Object.fromEntries(topicsConfig.map((t) => [t.topic, [...t.categories]]))
  );
  const [addModal, setAddModal]       = useState(null);  // topic string
  const [delModal, setDelModal]       = useState(null);  // { topic, category, count }
  const [toast, setToast]             = useState(null);

  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  // ── derived stats ──────────────────────────────────────────────────────────
  const totalQuestions  = questionsData.length;
  const totalTopics     = topicsConfig.length;
  const totalCategories = Object.values(topics).reduce((s, cats) => s + cats.length, 0);

  // ── chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(() =>
    topicsConfig.map((t) => ({
      topic: t.topic,
      count: questionsData.filter((q) => q.topic === t.topic).length,
      color: TOPIC_COLORS[t.color].chart,
    }))
  , []);

  // ── handlers ───────────────────────────────────────────────────────────────
  function handleAddCategory(topic, name) {
    setTopics((prev) => ({ ...prev, [topic]: [...(prev[topic] ?? []), name] }));
    setAddModal(null);
    showToast(`Category "${name}" added to ${topic}.`);
  }

  function handleDeleteCategory(topic, category) {
    setTopics((prev) => ({ ...prev, [topic]: prev[topic].filter((c) => c !== category) }));
    setDelModal(null);
    showToast(`Category "${category}" removed.`);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="space-y-5 pb-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderOpen size={22} className="text-amber-500" /> Categories & Topics
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage question topics and their sub-categories</p>
        </div>
        <Link to="/admin/questions/add"
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm self-start sm:self-auto shrink-0">
          <PlusCircle size={14} /> Add Question
        </Link>
      </div>

      {/* ── Overview Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Topics",     value: totalTopics,     icon: BookOpen,  color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20"    },
          { label: "Total Categories", value: totalCategories, icon: Tag,       color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/20"  },
          { label: "Total Questions",  value: totalQuestions,  icon: Database,  color: "text-teal-600 dark:text-teal-400",    bg: "bg-teal-50 dark:bg-teal-900/20"    },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`p-2.5 rounded-xl ${bg} shrink-0`}><Icon size={18} className={color} /></div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Questions per Topic Chart ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">Questions per Topic</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribution of questions across all topics</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="topic" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Questions" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Topic Cards Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {topicsConfig.map((cfg) => (
          <TopicCard
            key={cfg.topic}
            cfg={cfg}
            questions={questionsData}
            categories={topics[cfg.topic] ?? []}
            onAddCategory={(t) => setAddModal(t)}
            onDeleteCategory={(t, c, n) => setDelModal({ topic: t, category: c, count: n })}
          />
        ))}
      </div>

      {/* ── Difficulty Legend ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Difficulty colours:</p>
        {Object.entries(DIFF_COLORS).map(([d, color]) => (
          <span key={d} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />{d}
          </span>
        ))}
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">Hover category chips to reveal delete</span>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {addModal && (
        <AddCategoryModal topic={addModal} onAdd={handleAddCategory} onClose={() => setAddModal(null)} />
      )}
      {delModal && (
        <DeleteCategoryModal
          topic={delModal.topic}
          category={delModal.category}
          count={delModal.count}
          onConfirm={() => handleDeleteCategory(delModal.topic, delModal.category)}
          onClose={() => setDelModal(null)}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium">
          <CheckCircle size={15} className="text-emerald-400 dark:text-emerald-600 shrink-0" />{toast}
        </div>
      )}
    </div>
  );
}
