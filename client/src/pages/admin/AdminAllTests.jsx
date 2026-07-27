// AdminAllTests.jsx — Test Management > All Tests page.
// Displays admin-defined mock test templates with search, topic/status filtering,
// sortable table, and view/edit/delete modals. Manage test configs from here.

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Plus, Search, ChevronUp, ChevronDown, Eye, Edit2, Trash2,
  X, Clock, Target, Users, CheckCircle, AlertCircle, BookOpen, Shuffle,
  BarChart2, FileText,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { testConfigs as initialConfigs, TOPIC_COLORS, difficultyOptions } from "../../data/adminTestsData";
import { topicsConfig } from "../../data/adminQuestionsData";

const DIFF_COLORS = {
  Easy:   { bg: "bg-green-100 dark:bg-green-900/30",  text: "text-green-700 dark:text-green-300"  },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-700 dark:text-amber-300"  },
  Hard:   { bg: "bg-rose-100 dark:bg-rose-900/30",    text: "text-rose-700 dark:text-rose-300"    },
  Mixed:  { bg: "bg-slate-100 dark:bg-slate-700/30",  text: "text-slate-500 dark:text-slate-300"  },
};

const PAGE_SIZE = 10;

function TopicBadge({ topic }) {
  const c = TOPIC_COLORS[topic] || TOPIC_COLORS["DSA"];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{topic}</span>;
}

function DiffBadge({ difficulty }) {
  const c = DIFF_COLORS[difficulty] || DIFF_COLORS["Mixed"];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{difficulty}</span>;
}

function StatusBadge({ status }) {
  return status === "Active"
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"><CheckCircle size={10} />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-300"><AlertCircle size={10} />Draft</span>;
}

function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={13} className="text-slate-300 dark:text-slate-600" />;
  return dir === "asc" ? <ChevronUp size={13} className="text-blue-500" /> : <ChevronDown size={13} className="text-blue-500" />;
}

const EMPTY_FORM = {
  name: "", description: "", topic: "", categories: [],
  questionCount: 20, timeLimitMinutes: 30,
  difficulty: "Mixed", difficultyMix: { Easy: 7, Medium: 9, Hard: 4 },
  randomize: true, status: "Active",
};

export default function AdminAllTests() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [tests, setTests] = useState(initialConfigs);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'view' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (m, test) => { setSelected(test); setModal(m); if (m === "edit") setEditForm({ ...test }); };
  const closeModal = () => { setModal(null); setSelected(null); setEditErrors({}); };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let arr = [...tests];
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(t => t.name.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (topicFilter !== "All") arr = arr.filter(t => t.topic === topicFilter);
    if (statusFilter !== "All") arr = arr.filter(t => t.status === statusFilter);
    arr.sort((a, b) => {
      let av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return arr;
  }, [tests, search, topicFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total: tests.length,
    active: tests.filter(t => t.status === "Active").length,
    draft: tests.filter(t => t.status === "Draft").length,
    totalAttempts: tests.reduce((s, t) => s + t.attemptCount, 0),
  };

  // Edit modal helpers
  const topicCategories = topicsConfig.find(tc => tc.topic === editForm.topic)?.categories || [];
  const toggleCategory = (cat) => {
    setEditForm(f => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat],
    }));
  };
  const handleTopicChange = (t) => setEditForm(f => ({ ...f, topic: t, categories: [] }));

  const validateEdit = () => {
    const errs = {};
    if (!editForm.name.trim()) errs.name = "Name is required";
    if (!editForm.topic) errs.topic = "Topic is required";
    if (editForm.categories.length === 0) errs.categories = "Select at least one category";
    if (!editForm.questionCount || editForm.questionCount < 5 || editForm.questionCount > 50) errs.questionCount = "5–50 questions";
    if (!editForm.timeLimitMinutes || editForm.timeLimitMinutes < 5 || editForm.timeLimitMinutes > 120) errs.timeLimit = "5–120 minutes";
    if (editForm.difficulty === "Mixed") {
      const sum = (editForm.difficultyMix.Easy || 0) + (editForm.difficultyMix.Medium || 0) + (editForm.difficultyMix.Hard || 0);
      if (sum !== Number(editForm.questionCount)) errs.mixSum = `Mix total (${sum}) must equal question count (${editForm.questionCount})`;
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveEdit = () => {
    if (!validateEdit()) return;
    setTests(prev => prev.map(t => t.id === selected.id ? { ...t, ...editForm } : t));
    showToast("Test updated successfully");
    closeModal();
  };

  const confirmDelete = () => {
    setTests(prev => prev.filter(t => t.id !== selected.id));
    showToast("Test deleted", "error");
    closeModal();
  };

  const TH = ({ label, sk }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort(sk)}>
      <div className="flex items-center gap-1">{label}<SortIcon active={sortKey === sk} dir={sortDir} /></div>
    </th>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-blue-500" size={26} /> All Tests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all mock test templates available on the platform.</p>
        </div>
        <button
          onClick={() => navigate("/admin/tests/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} /> Create New Test
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tests",    value: stats.total,         icon: ClipboardList, color: "blue"    },
          { label: "Active",         value: stats.active,        icon: CheckCircle,   color: "green"   },
          { label: "Draft",          value: stats.draft,         icon: AlertCircle,   color: "slate"   },
          { label: "Total Attempts", value: stats.totalAttempts, icon: Users,         color: "indigo"  },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
              <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by test name or topic…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={topicFilter}
            onChange={e => { setTopicFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Topics</option>
            {topicsConfig.map(tc => <option key={tc.topic} value={tc.topic}>{tc.topic}</option>)}
          </select>
          <div className="flex gap-2">
            {["All", "Active", "Draft"].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-2 text-sm rounded-lg font-medium transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400">{filtered.length} test{filtered.length !== 1 ? "s" : ""} found</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <TH label="#" sk="id" />
                <TH label="Test Name" sk="name" />
                <TH label="Topic" sk="topic" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categories</th>
                <TH label="Questions" sk="questionCount" />
                <TH label="Time" sk="timeLimitMinutes" />
                <TH label="Difficulty" sk="difficulty" />
                <TH label="Status" sk="status" />
                <TH label="Attempts" sk="attemptCount" />
                <TH label="Avg Score" sk="avgScore" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginated.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-slate-400">No tests found</td></tr>
              ) : paginated.map(test => (
                <tr key={test.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{test.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900 dark:text-white">{test.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-[200px] truncate">{test.description}</p>
                  </td>
                  <td className="px-4 py-3"><TopicBadge topic={test.topic} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {test.categories.slice(0, 2).map(c => (
                        <span key={c} className="px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{c}</span>
                      ))}
                      {test.categories.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-500">+{test.categories.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{test.questionCount}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{test.timeLimitMinutes} min</td>
                  <td className="px-4 py-3"><DiffBadge difficulty={test.difficulty} /></td>
                  <td className="px-4 py-3"><StatusBadge status={test.status} /></td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{test.attemptCount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {test.avgScore > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${test.avgScore}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{test.avgScore}%</span>
                      </div>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal("view", test)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Eye size={15} /></button>
                      <button onClick={() => openModal("edit", test)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => openModal("delete", test)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={15} /></button>
                    </div>
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
        {paginated.length === 0 && <p className="text-center text-slate-400 py-8">No tests found</p>}
        {paginated.map(test => (
          <div key={test.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{test.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{test.description}</p>
              </div>
              <StatusBadge status={test.status} />
            </div>
            <div className="flex flex-wrap gap-2">
              <TopicBadge topic={test.topic} />
              <DiffBadge difficulty={test.difficulty} />
            </div>
            <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><BookOpen size={12} />{test.questionCount} Qs</span>
              <span className="flex items-center gap-1"><Clock size={12} />{test.timeLimitMinutes} min</span>
              <span className="flex items-center gap-1"><Users size={12} />{test.attemptCount} attempts</span>
              {test.avgScore > 0 && <span className="flex items-center gap-1"><BarChart2 size={12} />{test.avgScore}% avg</span>}
            </div>
            <div className="flex flex-wrap gap-1">
              {test.categories.map(c => (
                <span key={c} className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{c}</span>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => openModal("view", test)} className="flex-1 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-1 transition-colors"><Eye size={13} />View</button>
              <button onClick={() => openModal("edit", test)} className="flex-1 py-1.5 text-xs rounded-lg border border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center justify-center gap-1 transition-colors"><Edit2 size={13} />Edit</button>
              <button onClick={() => openModal("delete", test)} className="flex-1 py-1.5 text-xs rounded-lg border border-rose-200 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center gap-1 transition-colors"><Trash2 size={13} />Delete</button>
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

      {/* View Modal */}
      {modal === "view" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><ClipboardList size={18} className="text-blue-600 dark:text-blue-400" /></div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{selected.name}</h2>
                  <div className="flex gap-2 mt-1"><TopicBadge topic={selected.topic} /><StatusBadge status={selected.status} /></div>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {selected.description && <p className="text-sm text-slate-600 dark:text-slate-400">{selected.description}</p>}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Questions",  value: selected.questionCount, icon: BookOpen },
                  { label: "Time Limit", value: `${selected.timeLimitMinutes} min`, icon: Clock },
                  { label: "Difficulty", value: <DiffBadge difficulty={selected.difficulty} />, icon: Target },
                  { label: "Attempts",   value: selected.attemptCount.toLocaleString(), icon: Users },
                  { label: "Avg Score",  value: selected.avgScore > 0 ? `${selected.avgScore}%` : "—", icon: BarChart2 },
                  { label: "Randomize",  value: selected.randomize ? "Yes" : "No", icon: Shuffle },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><Icon size={11} />{label}</p>
                    <div className="mt-1 font-semibold text-slate-800 dark:text-white text-sm">{value}</div>
                  </div>
                ))}
              </div>
              {selected.difficulty === "Mixed" && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Difficulty Mix</p>
                  <div className="flex rounded-lg overflow-hidden h-4">
                    {[["Easy", "#22c55e"], ["Medium", "#f59e0b"], ["Hard", "#ef4444"]].map(([d, color]) => {
                      const count = selected.difficultyMix?.[d] || 0;
                      const pct = (count / selected.questionCount * 100).toFixed(1);
                      return count > 0 ? <div key={d} style={{ width: `${pct}%`, background: color }} title={`${d}: ${count}`} className="relative group"><span className="hidden group-hover:block absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs bg-slate-900 text-white px-2 py-0.5 rounded z-10">{d}: {count}</span></div> : null;
                    })}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {["Easy", "Medium", "Hard"].map(d => <span key={d}>{d}: {selected.difficultyMix?.[d] || 0}</span>)}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Categories ({selected.categories.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selected.categories.map(c => (
                    <span key={c} className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">{c}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400">Created: {new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex gap-2 px-5 pb-5">
              <button onClick={() => { closeModal(); openModal("edit", selected); }} className="flex-1 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center gap-2"><Edit2 size={14} />Edit Test</button>
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === "edit" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Edit2 size={18} className="text-amber-500" />Edit Test</h2>
              <button onClick={closeModal} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Test Name *</label>
                <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={`w-full px-3 py-2 text-sm rounded-lg border ${editErrors.name ? "border-rose-400" : "border-slate-200 dark:border-slate-600"} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                {editErrors.name && <p className="text-xs text-rose-500 mt-1">{editErrors.name}</p>}
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                <textarea rows={2} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              {/* Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Topic *</label>
                <select value={editForm.topic} onChange={e => handleTopicChange(e.target.value)} className={`w-full px-3 py-2 text-sm rounded-lg border ${editErrors.topic ? "border-rose-400" : "border-slate-200 dark:border-slate-600"} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}>
                  <option value="">Select topic…</option>
                  {topicsConfig.map(tc => <option key={tc.topic} value={tc.topic}>{tc.label}</option>)}
                </select>
                {editErrors.topic && <p className="text-xs text-rose-500 mt-1">{editErrors.topic}</p>}
              </div>
              {/* Categories */}
              {editForm.topic && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Categories *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {topicCategories.map(cat => (
                      <label key={cat} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${editForm.categories.includes(cat) ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300"}`}>
                        <input type="checkbox" className="accent-blue-600" checked={editForm.categories.includes(cat)} onChange={() => toggleCategory(cat)} />
                        {cat}
                      </label>
                    ))}
                  </div>
                  {editErrors.categories && <p className="text-xs text-rose-500 mt-1">{editErrors.categories}</p>}
                </div>
              )}
              {/* Q count + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Questions * (5–50)</label>
                  <input type="number" min={5} max={50} value={editForm.questionCount} onChange={e => setEditForm(f => ({ ...f, questionCount: Number(e.target.value) }))} className={`w-full px-3 py-2 text-sm rounded-lg border ${editErrors.questionCount ? "border-rose-400" : "border-slate-200 dark:border-slate-600"} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                  {editErrors.questionCount && <p className="text-xs text-rose-500 mt-1">{editErrors.questionCount}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Time Limit * (min)</label>
                  <input type="number" min={5} max={120} value={editForm.timeLimitMinutes} onChange={e => setEditForm(f => ({ ...f, timeLimitMinutes: Number(e.target.value) }))} className={`w-full px-3 py-2 text-sm rounded-lg border ${editErrors.timeLimit ? "border-rose-400" : "border-slate-200 dark:border-slate-600"} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`} />
                  {editErrors.timeLimit && <p className="text-xs text-rose-500 mt-1">{editErrors.timeLimit}</p>}
                </div>
              </div>
              {/* Difficulty */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Difficulty</label>
                <div className="flex gap-2 flex-wrap">
                  {difficultyOptions.map(d => (
                    <button key={d} type="button" onClick={() => setEditForm(f => ({ ...f, difficulty: d }))} className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${editForm.difficulty === d ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"}`}>{d}</button>
                  ))}
                </div>
              </div>
              {/* Mix counts */}
              {editForm.difficulty === "Mixed" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Difficulty Mix (must sum to {editForm.questionCount})</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[["Easy","green"],["Medium","amber"],["Hard","rose"]].map(([d, color]) => (
                      <div key={d}>
                        <label className={`block text-xs font-medium text-${color}-600 dark:text-${color}-400 mb-1`}>{d}</label>
                        <input type="number" min={0} value={editForm.difficultyMix[d] || 0} onChange={e => setEditForm(f => ({ ...f, difficultyMix: { ...f.difficultyMix, [d]: Number(e.target.value) } }))} className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                  </div>
                  {(() => { const sum = (editForm.difficultyMix.Easy||0)+(editForm.difficultyMix.Medium||0)+(editForm.difficultyMix.Hard||0); return <p className={`text-xs mt-1 ${sum === Number(editForm.questionCount) ? "text-green-600 dark:text-green-400" : "text-rose-500"}`}>Total: {sum} / {editForm.questionCount}{editErrors.mixSum ? " — " + editErrors.mixSum : ""}</p>; })()}
                </div>
              )}
              {/* Status + Randomize */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full transition-colors ${editForm.status === "Active" ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`} onClick={() => setEditForm(f => ({ ...f, status: f.status === "Active" ? "Draft" : "Active" }))}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${editForm.status === "Active" ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{editForm.status}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full transition-colors ${editForm.randomize ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}`} onClick={() => setEditForm(f => ({ ...f, randomize: !f.randomize }))}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${editForm.randomize ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Randomize</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 px-5 pb-5">
              <button onClick={saveEdit} className="flex-1 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">Save Changes</button>
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/30"><Trash2 size={24} className="text-rose-500" /></div>
              </div>
              <h2 className="text-center font-bold text-slate-900 dark:text-white text-lg">Delete Test?</h2>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                "<strong>{selected.name}</strong>" will be permanently removed. This action cannot be undone.
              </p>
              {selected.attemptCount > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <p className="text-xs text-amber-700 dark:text-amber-400 text-center">This test has {selected.attemptCount} attempt{selected.attemptCount !== 1 ? "s" : ""} on record.</p>
                </div>
              )}
              <div className="flex gap-2 mt-5">
                <button onClick={confirmDelete} className="flex-1 py-2 text-sm rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors">Delete</button>
                <button onClick={closeModal} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white transition-all ${toast.type === "error" ? "bg-rose-500" : "bg-green-500"}`}>
          {toast.type === "error" ? <Trash2 size={15} /> : <CheckCircle size={15} />} {toast.msg}
        </div>
      )}
    </div>
  );
}
