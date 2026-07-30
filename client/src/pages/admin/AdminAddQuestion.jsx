// AdminAddQuestion.jsx — Admin form to add questions to the question bank.
// Three modes:
//   Single  — one clean form for a single question.
//   Bulk    — multiple question forms stacked; "+ Add Another" to grow the list.
//   CSV     — paste or upload CSV rows, parse, preview, then import all at once.
//             (Currently marked "coming soon" in the UI — not wired to the backend.)
// Field shape mirrors the Supabase `questions` table: question, option_a..d,
// correct_answer, category_id, topic_id, difficulty, question_type, technique_id,
// company_id. Category -> Topic is a cascading pair (a topic belongs to one category);
// question_type / technique / company are optional enrichment fields.
// Single/Bulk submit to POST /api/admin/questions and /api/admin/questions/bulk.
// Reference data (categories/topics/techniques/technique-topics/companies) is
// fetched from the same admin metadata endpoints used by the Question Bank page.

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle, Trash2, ChevronDown, ChevronUp,
  CheckCircle, AlertTriangle, FileText, Database,
  Upload, Eye, X, ArrowLeft, Loader2,
} from "lucide-react";
import API_BASE from "../../utils/api";

const difficultyLevels = ["Easy", "Medium", "Hard"];

// ─── shared styles ────────────────────────────────────────────────────────────
const INPUT = "w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-colors";
const LABEL = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";
const ERR   = "border-rose-400 dark:border-rose-600 focus:ring-rose-400/40 focus:border-rose-400";

// ─── blank question factory ───────────────────────────────────────────────────
let _uid = 1000;
function blankQ() {
  return {
    _key: ++_uid,
    question: "", optionA: "", optionB: "", optionC: "", optionD: "",
    correctAnswer: "", categoryId: "", topicId: "", difficulty: "",
    questionType: "", techniqueId: "", companyId: "",
  };
}

// Converts a form question's string ids into the numeric/null shape the API expects.
function toPayload(q) {
  return {
    question: q.question,
    optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    categoryId: q.categoryId ? Number(q.categoryId) : null,
    topicId: q.topicId ? Number(q.topicId) : null,
    difficulty: q.difficulty,
    questionType: q.questionType || null,
    techniqueId: q.techniqueId ? Number(q.techniqueId) : null,
    companyId: q.companyId ? Number(q.companyId) : null,
  };
}

// ─── validation ───────────────────────────────────────────────────────────────
function validate(q) {
  const errs = {};
  if (!q.question.trim())    errs.question = "Required";
  if (!q.optionA.trim())     errs.optionA = "Required";
  if (!q.optionB.trim())     errs.optionB = "Required";
  if (!q.optionC.trim())     errs.optionC = "Required";
  if (!q.optionD.trim())     errs.optionD = "Required";
  if (!q.correctAnswer)      errs.correctAnswer = "Select one";
  if (!q.categoryId)         errs.categoryId = "Required";
  if (!q.topicId)             errs.topicId = "Required";
  if (!q.difficulty)         errs.difficulty = "Required";
  return errs;
}

function isValid(q) { return Object.keys(validate(q)).length === 0; }

// ─── Single Question Form ─────────────────────────────────────────────────────
function QuestionForm({ q, categories, topics, techniques, techniqueTopics, companies, onChange, errors = {}, index = null, onRemove, collapsed, onToggle }) {
  const categoryName = (id) => categories.find((c) => String(c.id) === String(id))?.name ?? "";
  const topicOptions = topics.filter((t) => String(t.categoryId) === String(q.categoryId));
  const techniqueOptions = useMemo(() => {
    const ids = techniqueTopics.filter((tt) => String(tt.topicId) === String(q.topicId)).map((tt) => tt.techniqueId);
    return ids.length ? techniques.filter((t) => ids.includes(t.id)) : techniques;
  }, [techniques, techniqueTopics, q.topicId]);

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
          {q.question ? `${q.question.slice(0, 55)}${q.question.length > 55 ? "…" : ""}` : `Question ${index + 1}`}
        </span>
        {q.categoryId && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">{categoryName(q.categoryId)}</span>}
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
        <textarea rows={3} value={q.question} onChange={set("question")} placeholder="Enter the question here…"
          className={`${INPUT} resize-none ${errors.question ? ERR : ""}`} />
        {errors.question && <p className="text-[11px] text-rose-500 mt-1">{errors.question}</p>}
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

      {/* Category / Topic / Difficulty */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>Category <span className="text-rose-500">*</span></label>
          <select value={q.categoryId} onChange={(e) => onChange({ ...q, categoryId: e.target.value, topicId: "" })}
            className={`${INPUT} ${errors.categoryId ? ERR : ""}`}>
            <option value="">Select category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.categoryId && <p className="text-[11px] text-rose-500 mt-1">{errors.categoryId}</p>}
        </div>
        <div>
          <label className={LABEL}>Topic <span className="text-rose-500">*</span></label>
          <select value={q.topicId} onChange={set("topicId")} disabled={!q.categoryId}
            className={`${INPUT} disabled:opacity-50 disabled:cursor-not-allowed ${errors.topicId ? ERR : ""}`}>
            <option value="">Select topic…</option>
            {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {errors.topicId && <p className="text-[11px] text-rose-500 mt-1">{errors.topicId}</p>}
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

      {/* Question Type / Technique / Company — optional */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>Question Type <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={q.questionType} onChange={set("questionType")} placeholder="e.g. Conceptual, Numerical…"
            className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Technique <span className="text-slate-400 font-normal">(optional)</span></label>
          <select value={q.techniqueId} onChange={set("techniqueId")} className={INPUT}>
            <option value="">None</option>
            {techniqueOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Company <span className="text-slate-400 font-normal">(optional)</span></label>
          <select value={q.companyId} onChange={set("companyId")} className={INPUT}>
            <option value="">None</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
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

// ─── CSV parsing helper ───────────────────────────────────────────────────────
// Handles quoted fields (commas/newlines inside "...") and "" escaped quotes.
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ─── CSV Import Preview ───────────────────────────────────────────────────────
// CSV uses human-readable names for category/topic/technique/company; they're
// resolved to ids here (category/topic are required, the rest stay optional).
// NOTE: this tab is marked "coming soon" in the UI and unreachable — kept
// functional (rather than deleted) for when it's wired up.
function CsvImportTab({ categories, topics, techniques, companies, onImport }) {
  const [raw, setRaw]       = useState("");
  const [parsed, setParsed] = useState(null);
  const [parseErr, setParseErr] = useState("");

  const categoryName = (id) => categories.find((c) => String(c.id) === String(id))?.name ?? "";
  const topicName    = (id) => topics.find((t) => String(t.id) === String(id))?.name ?? "";
  const topicsInCategory = (categoryId) => topics.filter((t) => String(t.categoryId) === String(categoryId));

  const REQUIRED = ["question","optionA","optionB","optionC","optionD","correctAnswer","category","topic","difficulty"];
  const OPTIONAL = ["questionType","technique","company"];
  const EXAMPLE = `${[...REQUIRED, ...OPTIONAL].join(",")}\nWhat is O(1) access in arrays called?,Linear,Constant,Logarithmic,Quadratic,B,DSA,Arrays,Easy,Conceptual,,Google`;

  function handleParse() {
    setParseErr("");
    try {
      const rows = parseCSV(raw.trim());
      if (rows.length < 2) throw new Error("CSV must include a header row and at least one data row");
      const header = rows[0].map((h) => h.trim());
      const missingCols = REQUIRED.filter((k) => !header.includes(k));
      if (missingCols.length) throw new Error(`Missing column(s): ${missingCols.join(", ")}`);

      const rawRows = rows.slice(1)
        .filter((r) => r.some((c) => c.trim() !== ""))
        .map((r) => {
          const obj = {};
          header.forEach((h, i) => { obj[h] = (r[i] ?? "").trim(); });
          return obj;
        });

      const issues = [];
      const data = [];
      rawRows.forEach((row, i) => {
        const missing = REQUIRED.filter((k) => !row[k]);
        if (missing.length) { issues.push(`Row ${i+1}: missing ${missing.join(", ")}`); return; }

        const category = categories.find((c) => c.name.toLowerCase() === row.category.toLowerCase());
        if (!category) { issues.push(`Row ${i+1}: unknown category "${row.category}"`); return; }

        const topic = topicsInCategory(category.id).find((t) => t.name.toLowerCase() === row.topic.toLowerCase());
        if (!topic) { issues.push(`Row ${i+1}: topic "${row.topic}" not found in category "${category.name}"`); return; }

        if (!["A","B","C","D"].includes(row.correctAnswer.toUpperCase())) {
          issues.push(`Row ${i+1}: correctAnswer must be A, B, C, or D`); return;
        }
        if (!difficultyLevels.includes(row.difficulty)) {
          issues.push(`Row ${i+1}: difficulty must be one of ${difficultyLevels.join(", ")}`); return;
        }

        let techniqueId = "";
        if (row.technique) {
          const technique = techniques.find((t) => t.name.toLowerCase() === row.technique.toLowerCase());
          if (!technique) { issues.push(`Row ${i+1}: unknown technique "${row.technique}"`); return; }
          techniqueId = technique.id;
        }

        let companyId = "";
        if (row.company) {
          const company = companies.find((c) => c.name.toLowerCase() === row.company.toLowerCase());
          if (!company) { issues.push(`Row ${i+1}: unknown company "${row.company}"`); return; }
          companyId = company.id;
        }

        data.push({
          question: row.question, optionA: row.optionA, optionB: row.optionB, optionC: row.optionC, optionD: row.optionD,
          correctAnswer: row.correctAnswer.toUpperCase(), categoryId: category.id, topicId: topic.id, difficulty: row.difficulty,
          questionType: row.questionType || "", techniqueId, companyId,
        });
      });

      if (issues.length) { setParseErr(issues.slice(0, 3).join("\n") + (issues.length > 3 ? `\n…and ${issues.length - 3} more` : "")); return; }
      setParsed(data);
    } catch (e) {
      setParseErr(e.message || "Invalid CSV");
    }
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setRaw(String(ev.target.result)); setParsed(null); setParseErr(""); };
    reader.readAsText(file);
    e.target.value = "";
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
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5"><FileText size={13} className="text-blue-500" /> Expected CSV format</p>
        <pre className="text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">{EXAMPLE}</pre>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">category/topic/technique/company use names, not ids — questionType, technique and company are optional (leave blank).</p>
      </div>

      {/* Upload or paste */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`${LABEL} mb-0`}>Paste CSV data</label>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <Upload size={12} /> Upload .csv
            <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
        <textarea rows={12} value={raw} onChange={(e) => { setRaw(e.target.value); setParsed(null); setParseErr(""); }}
          placeholder={`question,optionA,optionB,optionC,optionD,correctAnswer,category,topic,difficulty`}
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
                  {["#","Question","Category","Topic","Difficulty","Correct"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {parsed.map((q, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-slate-400 font-mono">{i+1}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-50"><p className="truncate">{q.question}</p></td>
                    <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">{categoryName(q.categoryId)}</span></td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{topicName(q.topicId)}</td>
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
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [techniqueTopics, setTechniqueTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [mode, setMode]       = useState("single");   // "single" | "bulk" | "csv"
  const [single, setSingle]   = useState(blankQ());
  const [singleErrs, setSingleErrs] = useState({});
  const [bulkList, setBulkList] = useState([blankQ()]);
  const [bulkErrs, setBulkErrs] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [success, setSuccess] = useState(null);       // { count }
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadReferenceData() {
      setLoading(true);
      setLoadError(null);
      try {
        const authHeaders = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };
        const [catRes, topRes, techRes, ttRes, compRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/categories`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/admin/topics`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/admin/techniques`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/admin/technique-topics`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/admin/companies`, { headers: authHeaders }),
        ]);
        if (![catRes, topRes, techRes, ttRes, compRes].every((r) => r.ok)) {
          throw new Error("Failed to load categories/topics data");
        }
        const [cat, top, tech, tt, comp] = await Promise.all([
          catRes.json(), topRes.json(), techRes.json(), ttRes.json(), compRes.json(),
        ]);
        setCategories(cat); setTopics(top); setTechniques(tech);
        setTechniqueTopics(tt); setCompanies(comp);
      } catch (err) {
        setLoadError(err.message || "Failed to load categories/topics data");
      } finally {
        setLoading(false);
      }
    }
    loadReferenceData();
  }, []);

  // ── Single submit ─────────────────────────────────────────────────────────
  async function handleSingleSubmit(e) {
    e.preventDefault();
    const errs = validate(single);
    if (Object.keys(errs).length) { setSingleErrs(errs); return; }
    setSingleErrs({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(toPayload(single)),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Failed to add question (${res.status})${detail ? `: ${detail}` : ""}`);
      }
      setSuccess({ count: 1 });
    } catch (err) {
      setSubmitError(err.message || "Failed to add question");
    } finally {
      setSubmitting(false);
    }
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

  async function handleBulkSubmit(e) {
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
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/questions/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(bulkList.map(toPayload)),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Failed to add questions (${res.status})${detail ? `: ${detail}` : ""}`);
      }
      setSuccess({ count: bulkList.length });
    } catch (err) {
      setSubmitError(err.message || "Failed to add questions");
    } finally {
      setSubmitting(false);
    }
  }

  // ── CSV import ────────────────────────────────────────────────────────────
  // Not wired to the backend yet — the CSV Import tab is disabled/"coming soon".
  function handleCsvImport(questions) {
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
    setSubmitError(null);
  }

  if (success) return <SuccessState count={success.count} onAddMore={resetAll} />;

  const validBulkCount = bulkList.filter(isValid).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 dark:text-slate-500">
        <Loader2 size={22} className="animate-spin mr-2" /> Loading categories & topics…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/40 rounded-xl p-10 text-center shadow-sm">
        <AlertTriangle size={28} className="text-rose-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{loadError}</p>
      </div>
    );
  }

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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Single, bulk, or CSV import</p>
        </div>
      </div>

      {/* ── Mode Tabs ──────────────────────────────────────────────────── */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { key: "single", label: "Single Question" },
          { key: "bulk",   label: `Bulk Add (${bulkList.length})` },
          { key: "csv",    label: "CSV Import", disabled: true },
        ].map(({ key, label, disabled }) =>
          disabled ? (
            <div
              key={key}
              title="Coming soon"
              className="flex-1 py-2 flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
            >
              {label}
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                Soon
              </span>
            </div>
          ) : (
            <button key={key} onClick={() => setMode(key)}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-colors ${mode === key ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
              {label}
            </button>
          )
        )}
      </div>

      {submitError && (
        <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-lg">
          <AlertTriangle size={14} className="text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 dark:text-rose-400">{submitError}</p>
        </div>
      )}

      {/* ══ SINGLE MODE ════════════════════════════════════════════════════ */}
      {mode === "single" && (
        <form onSubmit={handleSingleSubmit} noValidate>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <QuestionForm
              q={single}
              categories={categories}
              topics={topics}
              techniques={techniques}
              techniqueTopics={techniqueTopics}
              companies={companies}
              onChange={setSingle}
              errors={singleErrs}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => { setSingle(blankQ()); setSingleErrs({}); }}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Clear
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />} Add Question
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
                categories={categories}
                topics={topics}
                techniques={techniques}
                techniqueTopics={techniqueTopics}
                companies={companies}
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
            <button type="submit" disabled={submitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} Submit All ({bulkList.length}) Questions
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

      {/* ══ CSV IMPORT MODE ════════════════════════════════════════════════ */}
      {mode === "csv" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <CsvImportTab
            categories={categories}
            topics={topics}
            techniques={techniques}
            companies={companies}
            onImport={handleCsvImport}
          />
        </div>
      )}
    </div>
  );
}
