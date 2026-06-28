// TestInstructionsPage.jsx — pre-test instructions screen shown before every test.
// Receives test metadata (title, questions, time, etc.) via router state.
// The "Begin Test" button is gated behind a "I have read the instructions" checkbox
// to ensure users acknowledge the no-pause/no-refresh rules before starting the timer.

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, PlayCircle, Clock, Hash, BarChart3,
  Timer, RefreshCw, Target, Navigation2, Bookmark,
  Send, Trophy, Lightbulb, CheckCircle2, AlertCircle,
  ChevronRight, FileText, Layers,
} from "lucide-react";

const RULES = [
  {
    icon: Timer,
    cls: "text-amber-500",
    bg:  "bg-amber-50 dark:bg-amber-500/10",
    text: 'The timer starts immediately when you click "Begin Test" and cannot be paused.',
  },
  {
    icon: RefreshCw,
    cls: "text-rose-500",
    bg:  "bg-rose-50 dark:bg-rose-500/10",
    text: "Do not refresh or close the browser tab — your attempt will be lost.",
  },
  {
    icon: Target,
    cls: "text-indigo-500",
    bg:  "bg-indigo-50 dark:bg-indigo-500/10",
    text: "Each question has exactly one correct answer. Choose the best option.",
  },
  {
    icon: Navigation2,
    cls: "text-indigo-500",
    bg:  "bg-indigo-50 dark:bg-indigo-500/10",
    text: "Use the question navigator to jump freely between any question at any time.",
  },
  {
    icon: Bookmark,
    cls: "text-violet-500",
    bg:  "bg-violet-50 dark:bg-violet-500/10",
    text: "Flag questions for review and revisit them before your final submission.",
  },
  {
    icon: Send,
    cls: "text-emerald-500",
    bg:  "bg-emerald-50 dark:bg-emerald-500/10",
    text: "You may submit early at any time — unanswered questions are counted as skipped.",
  },
  {
    icon: Trophy,
    cls: "text-amber-500",
    bg:  "bg-amber-50 dark:bg-amber-500/10",
    text: "Your score and a full category breakdown appear immediately after submission.",
  },
];

const TIPS = [
  "Read all options carefully before selecting — the correct answer may not be obvious.",
  "On uncertain questions, eliminate clearly wrong options to improve your accuracy.",
  "Don't spend more than 90 seconds on one question — flag it and come back.",
  "Use the last few minutes to revisit all flagged questions.",
];

const STEPS = ["Read Instructions", "Take the Test", "View Results"];

function Chip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">
      <Icon size={11} className="text-slate-400 dark:text-slate-500" />
      {label}
    </span>
  );
}

export default function TestInstructionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  const st = location.state;

  /* Redirect if landed here directly with no state */
  if (!st?.nextUrl) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">
          Please start from the test selection page.
        </p>
        <button
          onClick={() => navigate("/practice/mock-tests")}
          className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Browse Tests
        </button>
      </div>
    );
  }

  const {
    nextUrl    = "/practice/mock-tests/dsa",
    nextState  = null,
    testTitle  = "Mock Assessment",
    questions  = 20,
    timeMins   = 90,
    difficulty = "Mixed",
    description = "",
  } = st;

  const handleBegin = () =>
    navigate(nextUrl, nextState ? { state: nextState } : undefined);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
              <FileText size={26} className="text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {testTitle}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip icon={Hash}     label={`${questions} Questions`} />
                <Chip icon={Clock}    label={`${timeMins} min`} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  <BarChart3 size={11} />
                  {difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Layers size={11} />
                  MCQ
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-extrabold transition-colors ${
                      i === 0
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {i === 0 ? "✓" : i + 1}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold whitespace-nowrap ${
                      i === 0
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 h-px bg-slate-200 dark:bg-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-900 dark:text-white">
            <AlertCircle size={14} className="text-indigo-500" />
            Instructions
          </h2>
          <div className="space-y-3">
            {RULES.map((rule, i) => {
              const Icon = rule.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${rule.bg}`}
                  >
                    <Icon size={14} className={rule.cls} />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {i + 1}.{" "}
                    </span>
                    {rule.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/5 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            <Lightbulb size={14} />
            Pro Tips
          </h2>
          <ul className="space-y-2.5">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-amber-900 dark:text-amber-200/80">
                <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-amber-500" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <label
          className={`mb-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-150 ${
            agreed
              ? "border-indigo-300 dark:border-indigo-500/50 bg-indigo-50 dark:bg-indigo-500/5"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-200 dark:hover:border-indigo-500/30"
          }`}
        >
          <div
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150 ${
              agreed
                ? "border-indigo-600 bg-indigo-600"
                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            {agreed && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
          </div>
          <span className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
            I have read and understood all the instructions above. I&apos;m ready to begin the test.
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBegin}
            disabled={!agreed}
            className={`flex flex-[2] items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-150 active:scale-[0.98] ${
              agreed
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 cursor-pointer"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            }`}
          >
            <PlayCircle size={16} />
            Begin Test
            {agreed && <ChevronRight size={14} />}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-600">
          Results are auto-graded and shown immediately after submission.
        </p>
      </div>
    </div>
  );
}
