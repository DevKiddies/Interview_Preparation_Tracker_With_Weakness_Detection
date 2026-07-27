// AdminCreateMockTest.jsx — Test Management > Create Mock Test page.
// Multi-section form for creating a new mock test template (name, topic, categories,
// question count, time limit, difficulty mix, randomize, status).
// Live preview panel updates as the admin fills the form.

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FilePlus, BookOpen, Clock, Target, Shuffle, CheckCircle,
  ChevronRight, ArrowLeft, AlertCircle, Info,
} from "lucide-react";
import { topicsConfig, questionsData } from "../../data/adminQuestionsData";
import { difficultyOptions, TOPIC_COLORS } from "../../data/adminTestsData";

const DIFF_BAR = { Easy: "#22c55e", Medium: "#f59e0b", Hard: "#ef4444" };

const INIT_FORM = {
  name: "",
  description: "",
  topic: "",
  categories: [],
  questionCount: 20,
  timeLimitMinutes: 30,
  difficulty: "Mixed",
  difficultyMix: { Easy: 7, Medium: 9, Hard: 4 },
  randomize: true,
  status: "Active",
};

function Toggle({ value, onChange, label, colorOn = "bg-blue-500" }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className={`relative w-11 h-6 rounded-full transition-colors ${value ? colorOn : "bg-slate-300 dark:bg-slate-600"}`} onClick={onChange}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
        <Icon size={16} className="text-blue-500" />
        <h3 className="font-semibold text-sm text-slate-800 dark:text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AdminCreateMockTest() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setMix = (d, val) => setForm(f => ({ ...f, difficultyMix: { ...f.difficultyMix, [d]: Number(val) } }));

  const handleTopicChange = (t) => setForm(f => ({ ...f, topic: t, categories: [] }));

  const toggleCategory = (cat) => setForm(f => ({
    ...f,
    categories: f.categories.includes(cat)
      ? f.categories.filter(c => c !== cat)
      : [...f.categories, cat],
  }));

  const topicMeta = topicsConfig.find(tc => tc.topic === form.topic);
  const topicCategories = topicMeta?.categories || [];
  const topicColor = TOPIC_COLORS[form.topic];

  // Count available questions matching current filters
  const availableCount = useMemo(() => {
    if (!form.topic) return 0;
    let pool = questionsData.filter(q => q.topic === form.topic);
    if (form.categories.length > 0) pool = pool.filter(q => form.categories.includes(q.category));
    return pool.length;
  }, [form.topic, form.categories]);

  const mixSum = (form.difficultyMix.Easy || 0) + (form.difficultyMix.Medium || 0) + (form.difficultyMix.Hard || 0);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Test name is required";
    if (!form.topic) errs.topic = "Please select a topic";
    if (form.categories.length === 0) errs.categories = "Select at least one category";
    if (!form.questionCount || form.questionCount < 5 || form.questionCount > 50) errs.questionCount = "Enter a value between 5 and 50";
    if (!form.timeLimitMinutes || form.timeLimitMinutes < 5 || form.timeLimitMinutes > 120) errs.timeLimit = "Enter a value between 5 and 120 minutes";
    if (form.difficulty === "Mixed" && mixSum !== Number(form.questionCount)) errs.mixSum = `Difficulty mix total (${mixSum}) must equal question count (${form.questionCount})`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-5 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle size={48} className="text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Test Created!</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">"{form.name}"</span> has been added to the test library.
          </p>
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 flex flex-col gap-2">
            <div className="flex justify-between"><span>Topic</span><span className="font-medium text-slate-900 dark:text-white">{form.topic}</span></div>
            <div className="flex justify-between"><span>Categories</span><span className="font-medium text-slate-900 dark:text-white">{form.categories.length} selected</span></div>
            <div className="flex justify-between"><span>Questions</span><span className="font-medium text-slate-900 dark:text-white">{form.questionCount}</span></div>
            <div className="flex justify-between"><span>Time Limit</span><span className="font-medium text-slate-900 dark:text-white">{form.timeLimitMinutes} min</span></div>
            <div className="flex justify-between"><span>Status</span><span className={`font-medium ${form.status === "Active" ? "text-green-600 dark:text-green-400" : "text-slate-500"}`}>{form.status}</span></div>
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <button onClick={() => { setForm(INIT_FORM); setErrors({}); setSuccess(false); }} className="flex-1 max-w-[180px] py-2.5 text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              Create Another
            </button>
            <button onClick={() => navigate("/admin/tests")} className="flex-1 max-w-[180px] py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors">
              View All Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate("/admin/tests")} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors mb-3">
          <ArrowLeft size={15} /> All Tests
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <FilePlus size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Mock Test</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Define a new test template for users on the platform.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form — left 2 cols */}
          <div className="xl:col-span-2 space-y-5">

            {/* Basic Info */}
            <SectionCard title="Basic Information" icon={BookOpen}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Test Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="e.g. DSA Fundamentals, SQL Mastery…"
                    className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.name ? "border-rose-400 bg-rose-50 dark:bg-rose-900/10" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"} text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.name && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Briefly describe what this test covers and who it's for…"
                    className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Test Configuration */}
            <SectionCard title="Test Configuration" icon={Target}>
              <div className="space-y-5">
                {/* Topic */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Topic <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {topicsConfig.map(tc => {
                      const c = TOPIC_COLORS[tc.topic];
                      const active = form.topic === tc.topic;
                      return (
                        <button
                          key={tc.topic}
                          type="button"
                          onClick={() => handleTopicChange(tc.topic)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${active ? `${c.bg} ${c.text} border-current ring-2 ring-offset-1 ring-current dark:ring-offset-slate-900` : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-900"}`}
                        >
                          {active && <CheckCircle size={14} />}
                          {tc.topic}
                        </button>
                      );
                    })}
                  </div>
                  {errors.topic && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.topic}</p>}
                </div>

                {/* Categories */}
                {form.topic && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Categories <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setForm(f => ({ ...f, categories: [...topicCategories] }))} className="text-xs text-blue-500 hover:underline">All</button>
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <button type="button" onClick={() => setForm(f => ({ ...f, categories: [] }))} className="text-xs text-slate-400 hover:underline">None</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {topicCategories.map(cat => {
                        const active = form.categories.includes(cat);
                        return (
                          <label key={cat} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${active ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600"}`}>
                            <input type="checkbox" className="accent-blue-600 shrink-0" checked={active} onChange={() => toggleCategory(cat)} />
                            <span className="truncate">{cat}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.categories && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.categories}</p>}
                    {availableCount > 0 && (
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><Info size={11} />{availableCount} question{availableCount !== 1 ? "s" : ""} available in selected categories</p>
                    )}
                  </div>
                )}

                {/* Q count + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      No. of Questions <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={50}
                      value={form.questionCount}
                      onChange={e => set("questionCount", Number(e.target.value))}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.questionCount ? "border-rose-400" : "border-slate-200 dark:border-slate-600"} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.questionCount
                      ? <p className="text-xs text-rose-500 mt-1">{errors.questionCount}</p>
                      : <p className="text-xs text-slate-400 mt-1">Range: 5–50</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                      Time Limit (minutes) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={form.timeLimitMinutes}
                      onChange={e => set("timeLimitMinutes", Number(e.target.value))}
                      className={`w-full px-3 py-2.5 text-sm rounded-lg border ${errors.timeLimit ? "border-rose-400" : "border-slate-200 dark:border-slate-600"} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    {errors.timeLimit
                      ? <p className="text-xs text-rose-500 mt-1">{errors.timeLimit}</p>
                      : <p className="text-xs text-slate-400 mt-1">Range: 5–120 min</p>}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Difficulty Mix */}
            <SectionCard title="Difficulty Mix" icon={Target}>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {difficultyOptions.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set("difficulty", d)}
                      className={`px-4 py-2 text-sm rounded-xl font-medium border transition-all ${form.difficulty === d ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-300"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {form.difficulty !== "Mixed" ? (
                  <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${form.difficulty === "Easy" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : form.difficulty === "Medium" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" : "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400"}`}>
                    <Info size={14} />
                    All {form.questionCount} questions will be <strong className="mx-1">{form.difficulty}</strong> difficulty.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[["Easy", "green"], ["Medium", "amber"], ["Hard", "rose"]].map(([d, color]) => (
                        <div key={d}>
                          <label className={`block text-xs font-semibold text-${color}-600 dark:text-${color}-400 mb-1.5`}>{d}</label>
                          <input
                            type="number"
                            min={0}
                            value={form.difficultyMix[d] || 0}
                            onChange={e => setMix(d, e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Mix bar */}
                    {mixSum > 0 && (
                      <div>
                        <div className="flex rounded-lg overflow-hidden h-3 bg-slate-100 dark:bg-slate-700">
                          {[["Easy","#22c55e"], ["Medium","#f59e0b"], ["Hard","#ef4444"]].map(([d, color]) => {
                            const count = form.difficultyMix[d] || 0;
                            const pct = mixSum > 0 ? (count / mixSum * 100).toFixed(1) : 0;
                            return count > 0 ? <div key={d} style={{ width: `${pct}%`, background: color }} /> : null;
                          })}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {[["Easy","#22c55e"],["Medium","#f59e0b"],["Hard","#ef4444"]].map(([d,c]) => (
                              <span key={d} className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />
                                {d}: {form.difficultyMix[d]||0}
                              </span>
                            ))}
                          </div>
                          <span className={`text-xs font-semibold ${mixSum === Number(form.questionCount) ? "text-green-600 dark:text-green-400" : "text-rose-500"}`}>
                            {mixSum} / {form.questionCount}
                          </span>
                        </div>
                        {errors.mixSum && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{errors.mixSum}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Settings */}
            <SectionCard title="Settings" icon={Shuffle}>
              <div className="space-y-4">
                <Toggle
                  value={form.randomize}
                  onChange={() => set("randomize", !form.randomize)}
                  label="Randomize question order for each user"
                />
                <Toggle
                  value={form.status === "Active"}
                  onChange={() => set("status", form.status === "Active" ? "Draft" : "Active")}
                  label={form.status === "Active" ? "Active — users can take this test" : "Draft — hidden from users"}
                  colorOn="bg-green-500"
                />
              </div>
            </SectionCard>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <FilePlus size={16} /> Create Test
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/tests")}
                className="px-5 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Live Preview — right col */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Live Preview</h3>
                </div>
                <div className="p-5 space-y-4">
                  {/* Test name */}
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {form.name || <span className="text-slate-400 font-normal">Untitled Test</span>}
                    </p>
                    {form.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{form.description}</p>}
                  </div>

                  {/* Topic badge */}
                  {form.topic && topicColor && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${topicColor.bg} ${topicColor.text}`}>
                      {topicMeta?.label || form.topic}
                    </span>
                  )}

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                      <BookOpen size={14} className="text-blue-500 mx-auto mb-1" />
                      <p className="text-base font-bold text-slate-900 dark:text-white">{form.questionCount || 0}</p>
                      <p className="text-xs text-slate-400">Questions</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                      <Clock size={14} className="text-indigo-500 mx-auto mb-1" />
                      <p className="text-base font-bold text-slate-900 dark:text-white">{form.timeLimitMinutes || 0}</p>
                      <p className="text-xs text-slate-400">Minutes</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                      <Target size={14} className="text-amber-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{form.difficulty}</p>
                      <p className="text-xs text-slate-400">Difficulty</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 text-center">
                      <Shuffle size={14} className="text-teal-500 mx-auto mb-1" />
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{form.randomize ? "Yes" : "No"}</p>
                      <p className="text-xs text-slate-400">Randomize</p>
                    </div>
                  </div>

                  {/* Difficulty mix bar */}
                  {form.difficulty === "Mixed" && mixSum > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Difficulty Mix</p>
                      <div className="flex rounded-lg overflow-hidden h-2.5 bg-slate-100 dark:bg-slate-700">
                        {[["Easy","#22c55e"],["Medium","#f59e0b"],["Hard","#ef4444"]].map(([d,color]) => {
                          const count = form.difficultyMix[d] || 0;
                          const pct = mixSum > 0 ? (count / mixSum * 100) : 0;
                          return count > 0 ? <div key={d} style={{ width: `${pct}%`, background: color }} /> : null;
                        })}
                      </div>
                      <div className="flex gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {[["Easy","#22c55e"],["Medium","#f59e0b"],["Hard","#ef4444"]].map(([d,c]) => (
                          <span key={d} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />
                            {form.difficultyMix[d]||0}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {form.categories.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Categories ({form.categories.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.categories.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${form.status === "Active" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-slate-100 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400"}`}>
                    {form.status === "Active" ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                    {form.status === "Active" ? "Will be visible to users immediately" : "Will be saved as Draft"}
                  </div>

                  {/* Available count info */}
                  {form.topic && form.categories.length > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${availableCount >= (form.questionCount || 0) ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"}`}>
                      <Info size={12} />
                      {availableCount} Qs in bank · need {form.questionCount || 0}
                      {availableCount < (form.questionCount || 0) && " (⚠ insufficient)"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
