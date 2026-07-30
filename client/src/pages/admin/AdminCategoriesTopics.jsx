// AdminCategoriesTopics.jsx — Admin page for managing question categories and topics.
// Shows a card per category with live question counts, difficulty distribution bar, and
// topic chips (a topic belongs to exactly one category). Includes an "Add Topic"
// modal, delete-topic action, and a horizontal bar chart of questions per category
// using Recharts.
// Fetches live data from GET /api/admin/categories, /api/admin/topics and
// /api/admin/questions, and writes through POST/DELETE /api/admin/topics.
// Categories are plain {id, name} from the DB (no color/label fields like the
// old mock data), so card colors are derived deterministically from the id.

import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  FolderOpen, PlusCircle, Trash2, X, CheckCircle,
  AlertTriangle, Database, Tag, BookOpen, ArrowRight, Loader2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { categoryStyle } from "../../utils/categoryColors";
import API_BASE from "../../utils/api";

const DIFF_COLORS = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#f43f5e" };
const difficultyLevels = ["Easy", "Medium", "Hard"];

// The DB stores difficulty in whatever case it was inserted with — normalize
// for grouping/display rather than assuming a specific stored case.
function normalizeDifficulty(d) {
  if (!d) return "";
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };
}

async function fetchPageData() {
  const [catRes, topRes, qRes] = await Promise.all([
    fetch(`${API_BASE}/api/admin/categories`, { headers: authHeaders() }),
    fetch(`${API_BASE}/api/admin/topics`, { headers: authHeaders() }),
    fetch(`${API_BASE}/api/admin/questions`, { headers: authHeaders() }),
  ]);
  if (![catRes, topRes, qRes].every((r) => r.ok)) {
    throw new Error("Failed to load categories & topics data");
  }
  const [categories, topics, questions] = await Promise.all([
    catRes.json(), topRes.json(), qRes.json(),
  ]);
  return { categories, topics, questions };
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: <span className="font-bold">{p.value}</span></p>)}
    </div>
  );
}

// ─── Add Topic Modal ───────────────────────────────────────────────────────
function AddTopicModal({ category, onAdd, onClose }) {
  const [name, setName] = useState("");
  const [err, setErr]   = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) { setErr("Topic name is required."); return; }
    if (name.trim().length < 2) { setErr("Name must be at least 2 characters."); return; }
    setSaving(true);
    setErr("");
    try {
      await onAdd(category.id, name.trim());
    } catch (e) {
      setErr(e.message || "Failed to add topic.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 shrink-0"><Tag size={18} className="text-blue-600 dark:text-blue-400" /></div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Add Topic</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Category: {category.name}</p>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Topic Name <span className="text-rose-500">*</span></label>
          <input value={name} onChange={(e) => { setName(e.target.value); setErr(""); }} placeholder="e.g. Advanced Trees"
            className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          {err && <p className="text-[11px] text-rose-500 mt-1">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />} Add Topic
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Topic Confirm ──────────────────────────────────────────────────
function DeleteTopicModal({ category, topic, count, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const blocked = count > 0;

  async function handleConfirm() {
    setDeleting(true);
    try {
      await onConfirm();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-900/20 w-fit mx-auto mb-4"><Trash2 size={22} className="text-rose-600 dark:text-rose-400" /></div>
        <p className="font-bold text-slate-900 dark:text-white mb-1">Delete "{topic}"?</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">From category: {category}</p>
        {blocked && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg mb-4 text-left">
            <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{count} question{count > 1 ? "s are" : " is"} tagged with this topic. Reassign or delete them first.</p>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={handleConfirm} disabled={blocked || deleting}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {deleting && <Loader2 size={14} className="animate-spin" />} {blocked ? "Cannot Delete" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category Card ───────────────────────────────────────────────────────────
function CategoryCard({ cfg, questions, topics, onAddTopic, onDeleteTopic }) {
  const c = categoryStyle(cfg.id);
  const categoryQs = questions.filter((q) => q.categoryId === cfg.id);
  const total      = categoryQs.length;

  const diffCounts = useMemo(() => {
    const map = {};
    difficultyLevels.forEach((d) => { map[d] = categoryQs.filter((q) => normalizeDifficulty(q.difficulty) === d).length; });
    return map;
  }, [categoryQs]);

  const topicCounts = useMemo(() => {
    const map = {};
    topics.forEach((t) => { map[t.id] = categoryQs.filter((q) => q.topicId === t.id).length; });
    return map;
  }, [categoryQs, topics]);

  return (
    <div className={`bg-white dark:bg-slate-900 border ${c.border} rounded-2xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow duration-200`}>
      {/* Category header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${c.bg}`}>
            <BookOpen size={18} className={c.icon} />
          </div>
          <p className="font-bold text-slate-900 dark:text-white">{cfg.name}</p>
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

      {/* Topics */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Topics</p>
          <button onClick={() => onAddTopic(cfg)}
            className={`text-[10px] font-semibold flex items-center gap-1 ${c.icon} hover:opacity-80 transition-opacity`}>
            <PlusCircle size={11} /> Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <div key={t.id} className="group relative">
              <span className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full text-[11px] font-medium ${c.badge}`}>
                {t.name}
                {topicCounts[t.id] > 0 && <span className="opacity-60">({topicCounts[t.id]})</span>}
                <button
                  onClick={() => onDeleteTopic(cfg, t, topicCounts[t.id] ?? 0)}
                  className="opacity-0 group-hover:opacity-100 ml-0.5 hover:text-rose-600 transition-all rounded-full"
                  title="Remove topic"
                >
                  <X size={10} />
                </button>
              </span>
            </div>
          ))}
          {topics.length === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No topics yet</p>
          )}
        </div>
      </div>

      {/* Footer link */}
      <Link
        to={`/admin/questions?categoryId=${cfg.id}`}
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
  const [categories, setCategories] = useState([]);
  const [topics, setTopics]         = useState([]);
  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const [addModal, setAddModal]       = useState(null);  // category object
  const [delModal, setDelModal]       = useState(null);  // { category, topic, count }
  const [toast, setToast]             = useState(null);

  const axisColor = isDark ? "#64748b" : "#94a3b8";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPageData();
      setCategories(data.categories);
      setTopics(data.topics);
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message || "Failed to load categories & topics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── derived stats ──────────────────────────────────────────────────────────
  const totalQuestions = questions.length;
  const totalCategories = categories.length;
  const totalTopics = topics.length;

  // ── chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(() =>
    categories.map((c) => ({
      category: c.name,
      count: questions.filter((q) => q.categoryId === c.id).length,
      color: categoryStyle(c.id).chart,
    }))
  , [categories, questions]);

  const topicsByCategory = useCallback(
    (categoryId) => topics.filter((t) => t.categoryId === categoryId),
    [topics],
  );

  // ── handlers ───────────────────────────────────────────────────────────────
  async function handleAddTopic(categoryId, name) {
    const res = await fetch(`${API_BASE}/api/admin/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name, categoryId }),
    });
    if (!res.ok) throw new Error(await res.text() || "Failed to add topic");
    const newTopic = await res.json();
    setTopics((prev) => [...prev, newTopic]);
    setAddModal(null);
    showToast(`Topic "${name}" added.`);
  }

  async function handleDeleteTopic(categoryId, topicId, topicName) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/topics/${topicId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to delete topic");
      setTopics((prev) => prev.filter((t) => t.id !== topicId));
      setDelModal(null);
      showToast(`Topic "${topicName}" removed.`);
    } catch (err) {
      showToast(err.message || "Failed to delete topic.");
      throw err;
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <Loader2 size={22} className="animate-spin mr-2" /> Loading categories & topics…
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

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderOpen size={22} className="text-amber-500" /> Categories & Topics
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage question categories and their topics</p>
        </div>
        <Link to="/admin/questions/add"
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm self-start sm:self-auto shrink-0">
          <PlusCircle size={14} /> Add Question
        </Link>
      </div>

      {/* ── Overview Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Categories", value: totalCategories, icon: BookOpen,  color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/20"    },
          { label: "Total Topics",     value: totalTopics,     icon: Tag,       color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-900/20"  },
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

      {/* ── Questions per Category Chart ────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-1">Questions per Category</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribution of questions across all categories</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="category" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={72} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Questions" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Category Cards Grid ─────────────────────────────────────────── */}
      {categories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-16 text-center shadow-sm">
          <FolderOpen size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200">No categories yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cfg) => (
            <CategoryCard
              key={cfg.id}
              cfg={cfg}
              questions={questions}
              topics={topicsByCategory(cfg.id)}
              onAddTopic={(cat) => setAddModal(cat)}
              onDeleteTopic={(cat, topic, count) => setDelModal({ category: cat, topic, count })}
            />
          ))}
        </div>
      )}

      {/* ── Difficulty Legend ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Difficulty colours:</p>
        {Object.entries(DIFF_COLORS).map(([d, color]) => (
          <span key={d} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />{d}
          </span>
        ))}
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">Hover topic chips to reveal delete</span>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {addModal && (
        <AddTopicModal category={addModal} onAdd={handleAddTopic} onClose={() => setAddModal(null)} />
      )}
      {delModal && (
        <DeleteTopicModal
          category={delModal.category.name}
          topic={delModal.topic.name}
          count={delModal.count}
          onConfirm={() => handleDeleteTopic(delModal.category.id, delModal.topic.id, delModal.topic.name)}
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
