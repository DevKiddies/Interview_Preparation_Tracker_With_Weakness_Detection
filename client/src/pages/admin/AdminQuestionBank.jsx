// AdminQuestionBank.jsx — Admin page for browsing, previewing, editing, and deleting
// all questions in the question bank. Supports live search, multi-filter (category /
// topic / difficulty), sortable table with pagination, a full-detail preview
// modal, an inline edit modal, and a delete confirmation modal.
// Fetches live data from GET /api/admin/questions and the reference-data
// endpoints (/api/admin/categories, /topics, /techniques, /companies,
// /technique-topics). Categories no longer carry a `color` field like the old
// mock did, so badge colors are assigned deterministically from the id instead.

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Database, Search, X, ChevronDown, ChevronUp,
  Eye, Pencil, Trash2, CheckCircle,
  AlertTriangle, Filter, ChevronLeft, ChevronRight, Loader2, RefreshCw,
} from "lucide-react";
import API_BASE from "../../utils/api";

// ─── constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;
const difficultyLevels = ["Easy", "Medium", "Hard"];

const DIFF_STYLE = {
  Easy:   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  Medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  Hard:   "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};
const CORRECT_STYLE = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";

const CATEGORY_PALETTE = ["blue", "indigo", "teal", "amber", "purple", "emerald"];
const CATEGORY_BADGE = {
  blue:    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  indigo:  "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  teal:    "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
  amber:   "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  purple:  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
};
// Categories are plain {id, name} from the DB (no color field), so badge
// colors are assigned deterministically from the id instead.
function categoryBadge(categoryId) {
  const key = CATEGORY_PALETTE[Number(categoryId) % CATEGORY_PALETTE.length];
  return CATEGORY_BADGE[key] ?? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function optionLetter(q, letter) {
  return q[`option${letter}`];
}

// The DB stores difficulty in whatever case it was inserted with (e.g. "easy"),
// but the UI's badges/filters key off "Easy"/"Medium"/"Hard" — normalize for
// comparison and display rather than assuming a specific stored case.
function normalizeDifficulty(d) {
  if (!d) return "";
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

// Windowed page list, e.g. [1, "…", 24, 25, 26, "…", 103] instead of every
// page number — with ~1,030 real questions at 10/page that's ~103 pages, far
// too many buttons to render in a row.
function paginationRange(current, total, delta = 1) {
  if (total <= 1) return [1];
  const range = [1];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  if (left > 2) range.push("…");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("…");
  range.push(total);

  return range;
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronDown size={11} className="text-slate-300 dark:text-slate-600" />;
  return sortDir === "asc" ? <ChevronUp size={11} className="text-blue-500" /> : <ChevronDown size={11} className="text-blue-500" />;
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const C = {
    blue:    "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/40 text-blue-700 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400",
    amber:   "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40 text-amber-700 dark:text-amber-400",
    rose:    "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/40 text-rose-700 dark:text-rose-400",
    slate:   "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300",
  }[color];
  return (
    <div className={`border rounded-xl px-4 py-3 flex flex-col gap-0.5 ${C}`}>
      <p className="text-xl font-extrabold leading-none">{value}</p>
      <p className="text-[11px] font-medium opacity-80">{label}</p>
    </div>
  );
}

// ─── Question Preview Modal ───────────────────────────────────────────────────
function PreviewModal({ q, categories, topics, techniques, companies, onClose }) {
  const categoryName = categories.find((c) => c.id === q.categoryId)?.name ?? "";
  const topicName = topics.find((t) => t.id === q.topicId)?.name ?? "";
  const techniqueName = techniques.find((t) => t.id === q.techniqueId)?.name ?? "";
  const companyName = companies.find((c) => c.id === q.companyId)?.name ?? "";
  const hasMeta = q.questionType || q.techniqueId || q.companyId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>

        {/* badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryBadge(q.categoryId)}`}>{categoryName}</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{topicName}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${DIFF_STYLE[normalizeDifficulty(q.difficulty)]}`}>{normalizeDifficulty(q.difficulty)}</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500">ID #{q.id}</span>
        </div>

        {hasMeta && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
            {[q.questionType, q.techniqueId && techniqueName, q.companyId && companyName].filter(Boolean).join(" · ")}
          </p>
        )}

        {/* question */}
        <p className="text-[15px] font-semibold text-slate-900 dark:text-white leading-relaxed mb-5 mt-3">{q.question}</p>

        {/* options */}
        <div className="flex flex-col gap-2.5">
          {["A", "B", "C", "D"].map((letter) => {
            const isCorrect = q.correctAnswer === letter;
            return (
              <div
                key={letter}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  isCorrect
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  isCorrect
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>{letter}</span>
                <span className={`text-sm leading-relaxed ${isCorrect ? "font-semibold text-emerald-800 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}`}>
                  {optionLetter(q, letter)}
                </span>
                {isCorrect && <CheckCircle size={15} className="text-emerald-500 shrink-0 ml-auto mt-0.5" />}
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="mt-5 w-full py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ q, categories, topics, techniques, techniqueTopics, companies, onSave, onClose }) {
  const [form, setForm] = useState({ ...q, difficulty: normalizeDifficulty(q.difficulty) });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const topicOptions = useMemo(
    () => topics.filter((t) => t.categoryId === Number(form.categoryId)),
    [topics, form.categoryId],
  );
  const techniqueOptions = useMemo(() => {
    const ids = techniqueTopics.filter((tt) => tt.topicId === Number(form.topicId)).map((tt) => tt.techniqueId);
    return ids.length ? techniques.filter((t) => ids.includes(t.id)) : techniques;
  }, [techniques, techniqueTopics, form.topicId]);

  const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
        <p className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Pencil size={16} className="text-blue-500" /> Edit Question #{q.id}</p>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Question Text</label>
            <textarea rows={3} value={form.question} onChange={set("question")} className={inputCls + " resize-none"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["A", "B", "C", "D"].map((l) => (
              <div key={l}>
                <label className={labelCls}>Option {l}</label>
                <input value={form[`option${l}`]} onChange={set(`option${l}`)} className={inputCls} />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div>
            <label className={labelCls}>Correct Answer</label>
            <div className="flex gap-2">
              {["A", "B", "C", "D"].map((l) => (
                <button
                  key={l}
                  onClick={() => setForm((p) => ({ ...p, correctAnswer: l }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                    form.correctAnswer === l
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600"
                  }`}
                >{l}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: Number(e.target.value), topicId: "" }))} className={inputCls}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Topic</label>
              <select value={form.topicId} onChange={(e) => setForm((p) => ({ ...p, topicId: Number(e.target.value) }))} className={inputCls}>
                {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <select value={form.difficulty} onChange={set("difficulty")} className={inputCls}>
                {difficultyLevels.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Question Type <span className="text-slate-400 font-normal">(optional)</span></label>
              <input value={form.questionType ?? ""} onChange={set("questionType")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Technique <span className="text-slate-400 font-normal">(optional)</span></label>
              <select value={form.techniqueId ?? ""} onChange={(e) => setForm((p) => ({ ...p, techniqueId: e.target.value ? Number(e.target.value) : "" }))} className={inputCls}>
                <option value="">None</option>
                {techniqueOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Company <span className="text-slate-400 font-normal">(optional)</span></label>
              <select value={form.companyId ?? ""} onChange={(e) => setForm((p) => ({ ...p, companyId: e.target.value ? Number(e.target.value) : "" }))} className={inputCls}>
                <option value="">None</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ q, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="p-4 rounded-full bg-rose-50 dark:bg-rose-900/20 w-fit mx-auto mb-4">
          <Trash2 size={24} className="text-rose-600 dark:text-rose-400" />
        </div>
        <p className="text-base font-bold text-slate-900 dark:text-white mb-2">Delete Question #{q.id}?</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">"{q.question}"</p>
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg mb-5 text-left">
          <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">This action cannot be undone. The question will be permanently removed.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={() => onConfirm(q.id)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// Reference-data lists (categories/topics/techniques/technique-topics/companies)
// rarely change, so they're fetched once per session and cached at module
// scope — revisiting the page (or another admin page importing this module)
// reuses them instead of re-fetching ~1830 questions' worth of lookups.
let referenceCache = null;

async function fetchReferenceData(force = false) {
  if (referenceCache && !force) return referenceCache;
  const authHeaders = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };
  const [catRes, topRes, techRes, ttRes, compRes] = await Promise.all([
    fetch(`${API_BASE}/api/admin/categories`, { headers: authHeaders }),
    fetch(`${API_BASE}/api/admin/topics`, { headers: authHeaders }),
    fetch(`${API_BASE}/api/admin/techniques`, { headers: authHeaders }),
    fetch(`${API_BASE}/api/admin/technique-topics`, { headers: authHeaders }),
    fetch(`${API_BASE}/api/admin/companies`, { headers: authHeaders }),
  ]);
  if (![catRes, topRes, techRes, ttRes, compRes].every((r) => r.ok)) {
    throw new Error("Failed to load question bank reference data");
  }
  const [categories, topics, techniques, techniqueTopics, companies] = await Promise.all([
    catRes.json(), topRes.json(), techRes.json(), ttRes.json(), compRes.json(),
  ]);
  referenceCache = { categories, topics, techniques, techniqueTopics, companies };
  return referenceCache;
}

// One page of questions from the server — search/filter/sort/paging all
// happen in the DB now instead of pulling every row down to the browser.
async function fetchQuestionsPage({ page, sortField, sortDir, search, categoryFilter, topicFilter, diffFilter }) {
  const authHeaders = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };
  const params = new URLSearchParams({
    page: String(page - 1),
    size: String(PAGE_SIZE),
    sortField,
    sortDir,
  });
  if (search.trim()) params.set("search", search.trim());
  if (categoryFilter !== "All") params.set("categoryId", String(categoryFilter));
  if (topicFilter !== "All") params.set("topicId", String(topicFilter));
  if (diffFilter !== "All") params.set("difficulty", diffFilter);

  const res = await fetch(`${API_BASE}/api/admin/questions/search?${params}`, { headers: authHeaders });
  if (!res.ok) throw new Error("Failed to load questions");
  return res.json();
}

async function fetchStats() {
  const authHeaders = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };
  const res = await fetch(`${API_BASE}/api/admin/questions/stats`, { headers: authHeaders });
  if (!res.ok) throw new Error("Failed to load question bank stats");
  return res.json();
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AdminQuestionBank() {
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]); // current page only — server-paginated
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [techniqueTopics, setTechniqueTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });
  const [loading, setLoading] = useState(true); // initial load (reference data + stats)
  const [tableLoading, setTableLoading] = useState(false); // subsequent page/filter fetches
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch]       = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Deep-linked from the Categories & Topics page's "View questions in bank"
  // card link (?categoryId=<id>) — read once on mount as the initial filter.
  const [categoryFilter, setCategoryFilter] = useState(() => {
    const fromUrl = searchParams.get("categoryId");
    return fromUrl ? Number(fromUrl) : "All";
  });
  const [topicFilter, setTopicFilter]       = useState("All");
  const [diffFilter, setDiffFilter]     = useState("All");
  const [sortField, setSortField]       = useState("id");
  const [sortDir, setSortDir]           = useState("asc");
  const [page, setPage]                 = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [categoryDropOpen, setCategoryDropOpen] = useState(false);
  const [topicDropOpen, setTopicDropOpen]       = useState(false);
  const [preview, setPreview]   = useState(null);
  const [editQ, setEditQ]       = useState(null);
  const [deleteQ, setDeleteQ]   = useState(null);
  const [toast, setToast]       = useState(null);

  // Debounce the search box so every keystroke doesn't fire a request.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reference data + stats load once (reference data may come straight from cache).
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      setError(null);
      try {
        const [ref, statsData] = await Promise.all([fetchReferenceData(), fetchStats()]);
        setCategories(ref.categories); setTopics(ref.topics); setTechniques(ref.techniques);
        setTechniqueTopics(ref.techniqueTopics); setCompanies(ref.companies);
        setStats(statsData);
      } catch (err) {
        setError(err.message || "Failed to load question bank data");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // Refetch the current page whenever paging/sorting/filters change.
  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    async function loadPage() {
      setTableLoading(true);
      setError(null);
      try {
        const data = await fetchQuestionsPage({
          page, sortField, sortDir, search: debouncedSearch, categoryFilter, topicFilter, diffFilter,
        });
        if (cancelled) return;
        setQuestions(data.content);
        setTotalElements(data.totalElements);
        const pages = Math.max(1, data.totalPages);
        setTotalPages(pages);
        if (page > pages) setPage(pages);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load questions");
      } finally {
        if (!cancelled) setTableLoading(false);
      }
    }
    loadPage();
    return () => { cancelled = true; };
  }, [loading, page, sortField, sortDir, debouncedSearch, categoryFilter, topicFilter, diffFilter, reloadKey]);

  async function handleRefresh() {
    setRefreshing(true);
    setError(null);
    try {
      const [ref, statsData] = await Promise.all([fetchReferenceData(true), fetchStats()]);
      setCategories(ref.categories); setTopics(ref.topics); setTechniques(ref.techniques);
      setTechniqueTopics(ref.techniqueTopics); setCompanies(ref.companies);
      setStats(statsData);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.message || "Failed to load question bank data");
    } finally {
      setRefreshing(false);
    }
  }

  // ── lookups ──────────────────────────────────────────────────────────────
  const categoryName = useCallback((id) => categories.find((c) => c.id === id)?.name ?? "", [categories]);
  const topicName    = useCallback((id) => topics.find((t) => t.id === id)?.name ?? "", [topics]);
  const topicsInCategory = useCallback((categoryId) => topics.filter((t) => t.categoryId === categoryId), [topics]);

  // ── topics for current category filter ─────────────────────────────────────
  const availTopics = useMemo(() => {
    if (categoryFilter === "All") return [];
    return topicsInCategory(categoryFilter);
  }, [categoryFilter, topicsInCategory]);

  const pageItems = questions;

  function handleSort(field) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPage(1);
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      });
      if (!res.ok) throw new Error("Failed to delete question");
      setDeleteQ(null);
      showToast("Question deleted.");
      fetchStats().then(setStats).catch(() => {});
      if (questions.length === 1 && page > 1) setPage((p) => p - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(err.message || "Failed to delete question");
    }
  }

  async function handleSave(updated) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/${updated.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update question");
      setEditQ(null);
      showToast("Question updated successfully.");
      fetchStats().then(setStats).catch(() => {});
      setReloadKey((k) => k + 1);
    } catch (err) {
      showToast(err.message || "Failed to update question");
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const TH = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap select-none";
  const THs = TH + " cursor-pointer hover:text-slate-700 dark:hover:text-slate-200";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <Loader2 size={22} className="animate-spin mr-2" /> Loading question bank…
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
            <Database size={22} className="text-teal-500" /> Question Bank
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Browse, edit and delete all questions in the database</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3.5 py-2 text-[13px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm self-start sm:self-auto shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <StatCard label="Total Questions" value={stats.total}  color="blue"    />
        <StatCard label="Easy"            value={stats.easy}   color="emerald" />
        <StatCard label="Medium"          value={stats.medium} color="amber"   />
        <StatCard label="Hard"            value={stats.hard}   color="rose"    />
        <StatCard label="Categories"      value={categories.length} color="slate" />
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-50">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input type="text" placeholder="Search question text or ID…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors" />
            {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><X size={14} /></button>}
          </div>

          {/* Category dropdown */}
          <div className="relative shrink-0">
            <button onClick={() => { setCategoryDropOpen((v) => !v); setTopicDropOpen(false); }}
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-w-32.5">
              <Filter size={14} className="text-slate-400" />
              <span className="flex-1 text-left">{categoryFilter === "All" ? "All Categories" : categoryName(categoryFilter)}</span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${categoryDropOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryDropOpen && (
              <div className="absolute left-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1">
                {["All", ...categories.map((c) => c.id)].map((c) => (
                  <button key={c} onClick={() => { setCategoryFilter(c); setTopicFilter("All"); setCategoryDropOpen(false); setPage(1); }}
                    className={`w-full px-4 py-2 text-left text-[13px] transition-colors ${categoryFilter === c ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                    {c === "All" ? "All Categories" : categoryName(c)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Topic dropdown (only when category selected) */}
          {categoryFilter !== "All" && (
            <div className="relative shrink-0">
              <button onClick={() => { setTopicDropOpen((v) => !v); setCategoryDropOpen(false); }}
                className="flex items-center gap-2 px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-w-37.5">
                <span className="flex-1 text-left">{topicFilter === "All" ? "All Topics" : topicName(topicFilter)}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${topicDropOpen ? "rotate-180" : ""}`} />
              </button>
              {topicDropOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1 max-h-52 overflow-y-auto">
                  {["All", ...availTopics.map((t) => t.id)].map((t) => (
                    <button key={t} onClick={() => { setTopicFilter(t); setTopicDropOpen(false); setPage(1); }}
                      className={`w-full px-4 py-2 text-left text-[13px] transition-colors ${topicFilter === t ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                      {t === "All" ? "All Topics" : topicName(t)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Difficulty pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 shrink-0">
            {["All", ...difficultyLevels].map((d) => (
              <button key={d} onClick={() => { setDiffFilter(d); setPage(1); }}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${diffFilter === d ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Active chips */}
        {(search || categoryFilter !== "All" || topicFilter !== "All" || diffFilter !== "All") && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400">Filters:</span>
            {search && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">"{search}" <button onClick={() => { setSearch(""); setPage(1); }}><X size={9} /></button></span>}
            {categoryFilter !== "All" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{categoryName(categoryFilter)} <button onClick={() => { setCategoryFilter("All"); setTopicFilter("All"); setPage(1); }}><X size={9} /></button></span>}
            {topicFilter !== "All" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{topicName(topicFilter)} <button onClick={() => { setTopicFilter("All"); setPage(1); }}><X size={9} /></button></span>}
            {diffFilter !== "All" && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${DIFF_STYLE[diffFilter]}`}>{diffFilter} <button onClick={() => { setDiffFilter("All"); setPage(1); }}><X size={9} /></button></span>}
            <button onClick={() => { setSearch(""); setCategoryFilter("All"); setTopicFilter("All"); setDiffFilter("All"); setPage(1); }} className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1">Clear all</button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between -mt-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{totalElements}</span> of {stats.total} questions
          {tableLoading && <Loader2 size={12} className="animate-spin text-slate-400 ml-1" />}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Page {page} of {totalPages}</p>
      </div>

      {/* ── Table (desktop) ────────────────────────────────────────────── */}
      {pageItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-16 text-center shadow-sm">
          <Database size={36} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200">No questions found</p>
          <p className="text-sm text-slate-500 mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className={THs} onClick={() => handleSort("id")}><span className="flex items-center gap-1"># <SortIcon field="id" sortField={sortField} sortDir={sortDir} /></span></th>
                  <th className={TH}>Question</th>
                  <th className={THs} onClick={() => handleSort("categoryId")}><span className="flex items-center gap-1">Category <SortIcon field="categoryId" sortField={sortField} sortDir={sortDir} /></span></th>
                  <th className={TH}>Topic</th>
                  <th className={THs} onClick={() => handleSort("difficulty")}><span className="flex items-center gap-1">Difficulty <SortIcon field="difficulty" sortField={sortField} sortDir={sortDir} /></span></th>
                  <th className={TH}>Correct Ans</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {pageItems.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-4 py-3.5 text-[12px] font-mono text-slate-400 dark:text-slate-500">#{q.id}</td>
                    <td className="px-4 py-3.5 max-w-80">
                      <p className="text-[13px] text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">{q.question}</p>
                    </td>
                    <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${categoryBadge(q.categoryId)}`}>{categoryName(q.categoryId)}</span></td>
                    <td className="px-4 py-3.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{topicName(q.topicId)}</td>
                    <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${DIFF_STYLE[normalizeDifficulty(q.difficulty)]}`}>{normalizeDifficulty(q.difficulty)}</span></td>
                    <td className="px-4 py-3.5"><span className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold ${CORRECT_STYLE}`}>{q.correctAnswer}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreview(q)} title="Preview" className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Eye size={14} /></button>
                        <button onClick={() => setEditQ(q)} title="Edit" className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteQ(q)} title="Delete" className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ──────────────────────────────────────────── */}
          <div className="lg:hidden flex flex-col gap-3">
            {pageItems.map((q) => (
              <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoryBadge(q.categoryId)}`}>{categoryName(q.categoryId)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${DIFF_STYLE[normalizeDifficulty(q.difficulty)]}`}>{normalizeDifficulty(q.difficulty)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CORRECT_STYLE}`}>Ans: {q.correctAnswer}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">#{q.id}</span>
                </div>
                <p className="text-[13px] text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mb-3">{q.question}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPreview(q)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><Eye size={13} /> View</button>
                  <button onClick={() => setEditQ(q)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-semibold border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"><Pencil size={13} /> Edit</button>
                  <button onClick={() => setDeleteQ(q)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors"><Trash2 size={13} /> Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronLeft size={16} />
              </button>
              {paginationRange(page, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-slate-400 dark:text-slate-600 select-none">…</span>
                ) : (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${n === page ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                    {n}
                  </button>
                )
              )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {preview && (
        <PreviewModal
          q={preview}
          categories={categories}
          topics={topics}
          techniques={techniques}
          companies={companies}
          onClose={() => setPreview(null)}
        />
      )}
      {editQ && (
        <EditModal
          q={editQ}
          categories={categories}
          topics={topics}
          techniques={techniques}
          techniqueTopics={techniqueTopics}
          companies={companies}
          onSave={handleSave}
          onClose={() => setEditQ(null)}
        />
      )}
      {deleteQ && <DeleteModal q={deleteQ} onConfirm={handleDelete} onClose={() => setDeleteQ(null)} />}

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium">
          <CheckCircle size={15} className="text-emerald-400 dark:text-emerald-600 shrink-0" />{toast}
        </div>
      )}
    </div>
  );
}
