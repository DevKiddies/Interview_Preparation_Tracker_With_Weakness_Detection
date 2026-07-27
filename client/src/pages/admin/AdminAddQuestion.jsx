// AdminAddQuestion.jsx — Admin form to add questions to the question bank.
// Three modes:
//   Single  — one clean form for a single question.
//   Bulk    — multiple question forms stacked; "+ Add Another" to grow the list.
//   JSON    — paste a JSON array, parse, preview, then import all at once.
// All fields match the backend Question entity exactly.
// Wire onSubmit / onBulkSubmit / onJsonImport to POST /api/admin/questions when ready.

import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle, Trash2, ChevronDown, ChevronUp,
  CheckCircle, AlertTriangle, FileJson, Database,
  Upload, Eye, X, ArrowLeft,
} from "lucide-react";
import { topicsConfig, difficultyLevels } from "../../data/adminQuestionsData";

// ─── shared styles ────────────────────────────────────────────────────────────
const INPUT = "w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors";
const LABEL = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
const ERR   = "border-rose-400 dark:border-rose-600 focus:ring-rose-400/40 focus:border-rose-400";

// ─── blank question factory ───────────────────────────────────────────────────
let _uid = 1000;
function blankQ() {
  return {
    _key: ++_uid,
    text: "", optionA: "", optionB: "", optionC: "", optionD: "",
    correctAnswer: "", topic: "", category: "", difficulty: "",
  };
}

// ─── validation ───────────────────────────────────────────────────────────────
function validate(q) {
  const errs = {};
  if (!q.text.trim())        errs.text = "Required";
  if (!q.optionA.trim())     errs.optionA = "Required";
  if (!q.optionB.trim())     errs.optionB = "Required";
  if (!q.optionC.trim())     errs.optionC = "Required";
  if (!q.optionD.trim())     errs.optionD = "Required";
  if (!q.correctAnswer)      errs.correctAnswer = "Select one";
  if (!q.topic)              errs.topic = "Required";
  if (!q.category)           errs.category = "Required";
  if (!q.difficulty)         errs.difficulty = "Required";
  return errs;
}

function isValid(q) { return Object.keys(validate(q)).length === 0; }

// ─── Single Question Form ─────────────────────────────────────────────────────
function QuestionForm({ q, onChange, errors = {}, index = null, onRemove, collapsed, onToggle }) {
  const cats = topicsConfig.find((t) => t.topic === q.topic)?.categories ?? [];
  const set = (k) => (e) => onChange({ ...q, [k]: e.target.value });
  const setField = (k, v) => onChange({ ...q, [k]: v });

  const DIFF_PILL = {
    Easy:   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
    Medium: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700",
    Hard:   "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700",
  };

  const header = index !== null ? (
    <button type="button" onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isValid(q) ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"}`}>
          {isValid(q) ? <CheckCircle size={12} /> : index + 1}
        </span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
          {q.text ? `${q.text.slice(0, 55)}${q.text.length > 55 ? "…" : ""}` : `Question ${index + 1}`}
        </span>
        {q.topic && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">{q.topic}</span>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRemove && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
            <Trash2 size={14} />
          </button>
        )}
        {collapsed ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronUp size={16} className="text-slate-400" />}
      </div>
    </button>
  ) : null;

  if (collapsed && index !== null) return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">{header}</div>
  );

  const body = (
    <div className={`space-y-4 ${index !== null ? "px-4 pb-4" : ""}`}>
      {/* Question Text */}
      <div>
        <label className={LABEL}>Question Text <span className="text-rose-500">*</span></label>
        <textarea rows={3} value={q.text} onChange={set("text")} placeholder="Enter the question here…"
          className={`${INPUT} resize-none ${errors.text ? ERR : ""}`} />
        {errors.text && <p className="text-[11px] text-rose-500 mt-1">{errors.text}</p>}
      </div>

      {/* Options A–D */}
      <div>
        <label className={LABEL}>Answer Options <span className="text-rose-500">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {["A", "B", "C", "D"].map((l) => {
            const key = `option${l}`;
            const isCorrect = q.correctAnswer === l;
            return (
              <div key={l} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${isCorrect ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"} ${errors[key] ? "border-rose-400" : ""}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isCorrect ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>{l}</span>
                <input value={q[key]} onChange={set(key)} placeholder={`Option ${l}`}
                  className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none" />
              </div>
            );
          })}
        </div>
        {(errors.optionA || errors.optionB || errors.optionC || errors.optionD) && (
          <p className="text-[11px] text-rose-500 mt-1">All 4 options are required</p>
        )}
      </div>

      {/* Correct Answer */}
      <div>
        <label className={LABEL}>Correct Answer <span className="text-rose-500">*</span></label>
        <div className="flex gap-2">
          {["A", "B", "C", "D"].map((l) => (
            <button type="button" key={l} onClick={() => setField("correctAnswer", l)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold border-2 transition-all ${q.correctAnswer === l ? "bg-emerald-500 border-emerald-500 text-white shadow-sm scale-105" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600"}`}>
              {l}
            </button>
          ))}
        </div>
        {errors.correctAnswer && <p className="text-[11px] text-rose-500 mt-1">{errors.correctAnswer}</p>}
        {q.correctAnswer && q[`option${q.correctAnswer}`] && (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle size={11} /> Correct: {q[`option${q.correctAnswer}`]}
          </p>
        )}
      </div>

      {/* Topic / Category / Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>Topic <span className="text-rose-500">*</span></label>
          <select value={q.topic} onChange={(e) => setField("topic", e.target.value) || onChange({ ...q, topic: e.target.value, category: "" })}
            className={`${INPUT} ${errors.topic ? ERR : ""}`}>
            <option value="">Select topic…</option>
            {topicsConfig.map((t) => <option key={t.topic} value={t.topic}>{t.topic}</option>)}
          </select>
          {errors.topic && <p className="text-[11px] text-rose-500 mt-1">{errors.topic}</p>}
        </div>
        <div>
          <label className={LABEL}>Category <span className="text-rose-500">*</span></label>
          <select value={q.category} onChange={set("category")} disabled={!q.topic}
            className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed ${errors.category ? ERR : ""}`}>
            <option value="">Select category…</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="text-[11px] text-rose-500 mt-1">{errors.category}</p>}
        </div>
        <div>
          <label className={LABEL}>Difficulty <span className="text-rose-500">*</span></label>
          <div className="flex gap-1.5">
            {difficultyLevels.map((d) => (
              <button type="button" key={d} onClick={() => setField("difficulty", d)}
                className={`flex-1 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${q.difficulty === d ? DIFF_PILL[d] + " border-2" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                {d}
              </button>
            ))}
          </div>
          {errors.difficulty && <p className="text-[11px] text-rose-500 mt-1">{errors.difficulty}</p>}
        </div>
      </div>
    </div>
  );

  if (index !== null) return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
      {header}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4">{body}</div>
    </div>
  );

  return body;
}

// ─── JSON Import Preview ──────────────────────────────────────────────────────
function JsonImportTab({ onImport, showToast }) {
  const [raw, setRaw]       = useState("");
  const [parsed, setParsed] = useState(null);
  const [parseErr, setParseErr] = useState("");

  const EXAMPLE = JSON.stringify([
    { text: "What is O(1) access in arrays called?", optionA: "Linear", optionB: "Constant", optionC: "Logarithmic", optionD: "Quadratic", correctAnswer: "B", topic: "DSA", category: "Arrays", difficulty: "Easy" }
  ], null, 2);

  function handleParse() {
    setParseErr("");
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error("Expected a JSON array [ … ]");
      const required = ["text","optionA","optionB","optionC","optionD","correctAnswer","topic","category","difficulty"];
      const issues = [];
      data.forEach((q, i) => {
        const missing = required.filter((k) => !q[k]);
        if (missing.length) issues.push(`Row ${i+1}: missing ${missing.join(", ")}`);
      });
      if (issues.length) { setParseErr(issues.slice(0, 3).join("\n") + (issues.length > 3 ? `\n…and ${issues.length - 3} more` : "")); return; }
      setParsed(data);
    } catch (e) {
      setParseErr(e.message || "Invalid JSON");
    }
  }

  function handleImport() {
    onImport(parsed);
    setParsed(null);
    setRaw("");
  }

  return (
    <div className="space-y-5">
      {/* Template hint */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5"><FileJson size={13} className="text-blue-500" /> Expected JSON format</p>
        <pre className="text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">{EXAMPLE}</pre>
      </div>

      {/* Textarea */}
      <div>
        <label className={LABEL}>Paste JSON array of questions</label>
        <textarea rows={12} value={raw} onChange={(e) => { setRaw(e.target.value); setParsed(null); setParseErr(""); }}
          placeholder='[ { "text": "...", "optionA": "...", ... } ]'
          className={`${INPUT} font-mono text-xs resize-y ${parseErr ? ERR : ""}`} />
        {parseErr && (
          <div className="mt-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-lg">
            <p className="text-[11px] text-rose-600 dark:text-rose-400 whitespace-pre-line">{parseErr}</p>
          </div>
        )}
      </div>

      <button type="button" onClick={handleParse} disabled={!raw.trim()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white disabled:opacity-40 transition-colors">
        <Eye size={15} /> Parse & Preview
      </button>

      {/* Preview table */}
      {parsed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" /> {parsed.length} question{parsed.length !== 1 ? "s" : ""} parsed successfully
            </p>
            <button type="button" onClick={() => setParsed(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={16} /></button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {["#","Question","Topic","Category","Difficulty","Correct"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {parsed.map((q, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-slate-400 font-mono">{i+1}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[200px]"><p className="truncate">{q.text}</p></td>
                    <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{q.topic}</span></td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{q.category}</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{q.difficulty}</td>
                    <td className="px-3 py-2 font-bold text-emerald-600 dark:text-emerald-400">{q.correctAnswer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={handleImport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">
            <Upload size={15} /> Import {parsed.length} Questions
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Success State ────────────────────────────────────────────────────────────
function SuccessState({ count, onAddMore }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="p-5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-5">
        <CheckCircle size={40} className="text-emerald-500" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
        {count === 1 ? "Question Added!" : `${count} Questions Added!`}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
        {count === 1 ? "The question has been saved to the question bank." : `All ${count} questions have been saved to the question bank.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onAddMore} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm">
          <PlusCircle size={15} /> Add More Questions
        </button>
        <Link to="/admin/questions" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <Database size={15} /> View Question Bank
        </Link>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────
export default function AdminAddQuestion() {
  const [mode, setMode]       = useState("single");   // "single" | "bulk" | "json"
  const [single, setSingle]   = useState(blankQ());
  const [singleErrs, setSingleErrs] = useState({});
  const [bulkList, setBulkList] = useState([blankQ()]);
  const [bulkErrs, setBulkErrs] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [success, setSuccess] = useState(null);       // { count }
  const toastRef = useRef(null);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  // ── Single submit ─────────────────────────────────────────────────────────
  function handleSingleSubmit(e) {
    e.preventDefault();
    const errs = validate(single);
    if (Object.keys(errs).length) { setSingleErrs(errs); return; }
    setSingleErrs({});
    // TODO: POST /api/admin/questions with single question payload
    setSuccess({ count: 1 });
  }

  // ── Bulk: add / remove / update ───────────────────────────────────────────
  function addBulk() {
    const q = blankQ();
    setBulkList((p) => [...p, q]);
    setCollapsed((p) => {
      const next = { ...p };
      Object.keys(next).forEach((k) => { next[k] = true; });
      return next;
    });
  }
  function removeBulk(key) { setBulkList((p) => p.filter((q) => q._key !== key)); }
  function updateBulk(key, updated) { setBulkList((p) => p.map((q) => (q._key === key ? updated : q))); }
  function toggleCollapse(key) { setCollapsed((p) => ({ ...p, [key]: !p[key] })); }

  function handleBulkSubmit(e) {
    e.preventDefault();
    const allErrs = {};
    let hasErr = false;
    bulkList.forEach((q) => {
      const errs = validate(q);
      if (Object.keys(errs).length) { allErrs[q._key] = errs; hasErr = true; }
    });
    if (hasErr) {
      setBulkErrs(allErrs);
      setCollapsed((p) => {
        const next = { ...p };
        Object.keys(allErrs).forEach((k) => { next[k] = false; });
        return next;
      });
      return;
    }
    setBulkErrs({});
    // TODO: POST /api/admin/questions/bulk with bulkList payload
    setSuccess({ count: bulkList.length });
  }

  // ── JSON import ───────────────────────────────────────────────────────────
  function handleJsonImport(questions) {
    // TODO: POST /api/admin/questions/bulk with questions payload
    setSuccess({ count: questions.length });
  }

  // ── reset after success ───────────────────────────────────────────────────
  function resetAll() {
    setSingle(blankQ());
    setSingleErrs({});
    setBulkList([blankQ()]);
    setBulkErrs({});
    setCollapsed({});
    setSuccess(null);
  }

  if (success) return <SuccessState count={success.count} onAddMore={resetAll} />;

  const validBulkCount = bulkList.filter(isValid).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link to="/admin/questions" className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <PlusCircle size={22} className="text-blue-500" /> Add Question
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Single, bulk, or JSON import</p>
        </div>
      </div>

      {/* ── Mode Tabs ──────────────────────────────────────────────────── */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { key: "single", label: "Single Question" },
          { key: "bulk",   label: `Bulk Add (${bulkList.length})` },
          { key: "json",   label: "JSON Import" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setMode(key)}
            className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-colors ${mode === key ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ══ SINGLE MODE ════════════════════════════════════════════════════ */}
      {mode === "single" && (
        <form onSubmit={handleSingleSubmit} noValidate>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <QuestionForm q={single} onChange={setSingle} errors={singleErrs} />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => { setSingle(blankQ()); setSingleErrs({}); }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Clear
            </button>
            <button type="submit" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors shadow-sm">
              <PlusCircle size={15} /> Add Question
            </button>
          </div>
        </form>
      )}

      {/* ══ BULK MODE ══════════════════════════════════════════════════════ */}
      {mode === "bulk" && (
        <form onSubmit={handleBulkSubmit} noValidate>
          {/* progress indicator */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{validBulkCount}</span> / {bulkList.length} questions complete
            </p>
            <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: bulkList.length ? `${(validBulkCount / bulkList.length) * 100}%` : "0%" }} />
            </div>
          </div>

          <div className="space-y-3">
            {bulkList.map((q, i) => (
              <QuestionForm
                key={q._key}
                q={q}
                onChange={(updated) => updateBulk(q._key, updated)}
                errors={bulkErrs[q._key] ?? {}}
                index={i}
                onRemove={bulkList.length > 1 ? () => removeBulk(q._key) : undefined}
                collapsed={!!collapsed[q._key]}
                onToggle={() => toggleCollapse(q._key)}
              />
            ))}
          </div>

          {/* Add Another */}
          <button type="button" onClick={addBulk}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-semibold">
            <PlusCircle size={16} /> Add Another Question
          </button>

          {/* Submit */}
          <div className="mt-4 flex items-center gap-3">
            <button type="button" onClick={() => { setBulkList([blankQ()]); setBulkErrs({}); setCollapsed({}); }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Reset All
            </button>
            <button type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors shadow-sm">
              <Upload size={15} /> Submit All ({bulkList.length}) Questions
            </button>
          </div>

          {Object.keys(bulkErrs).length > 0 && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-lg">
              <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-400">
                {Object.keys(bulkErrs).length} question{Object.keys(bulkErrs).length > 1 ? "s have" : " has"} errors. Please fix them before submitting.
              </p>
            </div>
          )}
        </form>
      )}

      {/* ══ JSON IMPORT MODE ═══════════════════════════════════════════════ */}
      {mode === "json" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <JsonImportTab onImport={handleJsonImport} showToast={showToast} />
        </div>
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
