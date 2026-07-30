import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, PlayCircle, FileText, Clock, HelpCircle, BarChart2 } from "lucide-react";

const RULES = [
  "The timer begins immediately upon start and cannot be paused.",
  "Do not reload or close the tab — your attempt will be lost.",
  "Each question contains exactly one correct choice.",
  "Move freely between questions using the question index.",
  "Flag questions to revisit them prior to final submission.",
  "You may submit at any time. Unanswered questions are scored as 0.",
];

const TIPS = [
  "Eliminate obviously incorrect choices to narrow your options.",
  "If stuck on a question for > 90 seconds, flag it and move forward.",
  "Allocate the final 3 minutes to review flagged questions.",
];

export default function TestInstructionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  const st = location.state;

  if (!st?.nextUrl) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center bg-zinc-50 px-4 dark:bg-slate-950">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl shadow-zinc-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-slate-800">
              <FileText size={20} className="text-zinc-400 dark:text-slate-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">No assessment selected</h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed dark:text-slate-400">
              Select an assessment from the test library to view instructions.
            </p>
            <button
                onClick={() => navigate("/practice/mock-tests")}
                className="mt-6 w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white shadow-md hover:bg-zinc-800 transition-all active:scale-95 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Back to test library
            </button>
          </div>
        </div>
    );
  }

  const {
    nextUrl = "/practice/mock-tests/dsa",
    nextState = null,
    testTitle = "Mock Assessment",
    questions = 20,
    timeMins = 90,
    difficulty = "Mixed",
    description = "",
  } = st;

  const handleBegin = () => {
    if (!agreed) return;
    navigate(nextUrl, nextState ? { state: nextState } : undefined);
  };

  return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full max-w-full flex-col justify-center overflow-x-hidden bg-zinc-50/60 p-4 font-sans text-zinc-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto flex w-full max-w-2xl flex-col py-4">

          {/* Top bar */}
          <div className="mb-4 flex shrink-0 items-center justify-between px-2">
            <button
                onClick={() => navigate(-1)}
                className="group inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-800 transition-colors dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back to selection</span>
            </button>

            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-500 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            Test Instructions
          </span>
          </div>

          {/* Card - Made puffy with rounded-3xl and soft shadows */}
          <div className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">

            {/* Header + Stats */}
            <div className="border-b border-zinc-200 px-6 py-5 shrink-0 dark:border-slate-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
              <h1 className="mt-0 mb-2 text-xl font-extrabold text-zinc-900 dark:text-white">
                {testTitle}
              </h1>
                  {description && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                        {description}
                      </p>
                  )}
                </div>

                {/* Stat badges — rounded-2xl with slightly more padding */}
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <HelpCircle size={12} className="text-zinc-400 dark:text-slate-500" />
                    <span className="text-zinc-500 dark:text-slate-400">Items:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{questions}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <Clock size={12} className="text-zinc-400 dark:text-slate-500" />
                    <span className="text-zinc-500 dark:text-slate-400">Time:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{timeMins}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
                    <BarChart2 size={12} className="text-zinc-400 dark:text-slate-500" />
                    <span className="text-zinc-500 dark:text-slate-400">Level:</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{difficulty}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split content */}
            <div className="grid grid-cols-1 divide-y divide-zinc-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-slate-800">

              <div className="flex flex-col justify-center p-6">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                  Examination rules
                </h2>
                <ol className="space-y-3">
                  {RULES.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-zinc-600 dark:text-slate-300">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold text-zinc-500 dark:bg-slate-800 dark:text-slate-400">{i + 1}</span>
                        <span>{rule}</span>
                      </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col justify-center bg-zinc-50/50 p-6 dark:bg-slate-900/40">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                  Recommended strategy
                </h2>
                <ul className="space-y-3">
                  {TIPS.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-zinc-600 dark:text-slate-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-slate-600" />
                        <span>{tip}</span>
                      </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action footer — rounded buttons and slightly more padding */}
            <div className="shrink-0 border-t border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <label className="flex cursor-pointer select-none items-center gap-2.5">
                  <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="h-4 w-4 rounded-md border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:focus:ring-slate-500"
                  />
                  <span className="text-[13px] font-medium text-zinc-700 dark:text-slate-300">
                  I have read and agree to follow all examination rules.
                </span>
                </label>

                <div className="flex shrink-0 items-center gap-2.5">
                  <button
                      onClick={() => navigate(-1)}
                      className="h-10 rounded-full border border-zinc-200 bg-white px-5 text-[13px] font-semibold text-zinc-600 shadow-sm hover:bg-zinc-50 hover:shadow transition-all active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                      onClick={handleBegin}
                      disabled={!agreed}
                      className={`flex h-10 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold shadow-sm transition-all active:scale-95 ${
                          agreed
                              ? "bg-zinc-900 text-white shadow-zinc-900/20 hover:bg-zinc-800 hover:shadow-md dark:bg-slate-700 dark:hover:bg-slate-600"
                              : "cursor-not-allowed bg-zinc-100 text-zinc-400 shadow-none dark:bg-slate-800 dark:text-slate-600"
                      }`}
                  >
                    <PlayCircle size={16} />
                    <span>Begin assessment</span>
                  </button>
                </div>

              </div>
            </div>

          </div>

          <p className="mt-3 shrink-0 text-center text-[11px] font-medium text-zinc-400 dark:text-slate-600">
            Submissions are final and automatically log timestamp.
          </p>

        </div>
      </div>
  );
}