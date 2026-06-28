// TestResultPage.jsx — post-test results page.
// Receives the graded result object via router state (populated by MockTestPage after submission).
// Shows overall score, per-category breakdown, and an expandable answer review for each question.
// The retakeUrl and retakeState props let the user re-enter the same test configuration.

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2, XCircle, MinusCircle, Clock, Trophy,
  RotateCcw, ChevronDown, ChevronUp, ArrowLeft,
} from "lucide-react";

const OPTION_LABELS = ["A", "B", "C", "D"];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// SVG circle ring where filled arc length = (score / total) * circumference.
// Color thresholds: green ≥70%, amber ≥40%, red below.
function ScoreRing({ score, total }) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg className="-rotate-90" width="144" height="144">
        <circle
          cx="72" cy="72" r={r}
          strokeWidth="10" fill="none"
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx="72" cy="72" r={r}
          strokeWidth="10" fill="none"
          stroke={color}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {score}/{total}
        </p>
        <p className="text-sm font-bold" style={{ color }}>{pct}%</p>
      </div>
    </div>
  );
}

function QuestionReviewItem({ result, index }) {
  const [open, setOpen] = useState(false);
  const skipped = result.yourAnswer == null;
  const correct = result.correct;

  const StatusIcon = skipped
    ? MinusCircle
    : correct
    ? CheckCircle2
    : XCircle;

  const statusColor = skipped
    ? "text-slate-400"
    : correct
    ? "text-emerald-500"
    : "text-rose-500";

  const borderColor = skipped
    ? "border-slate-200 dark:border-slate-700"
    : correct
    ? "border-emerald-200 dark:border-emerald-500/30"
    : "border-rose-200 dark:border-rose-500/30";

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${borderColor}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
      >
        <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">
          Q{index + 1}
        </span>
        <StatusIcon size={16} className={`shrink-0 ${statusColor}`} />
        <span className="flex-1 line-clamp-1 text-sm font-medium text-slate-800 dark:text-slate-200">
          {result.text}
        </span>
        {open
          ? <ChevronUp size={14} className="shrink-0 text-slate-400" />
          : <ChevronDown size={14} className="shrink-0 text-slate-400" />
        }
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-4">
          <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {result.text}
          </p>
          <div className="flex flex-col gap-2">
            {result.options.map((opt, i) => {
              const isCorrect = opt === result.correctAnswer;
              const isYours   = opt === result.yourAnswer;
              const cls = isCorrect
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/40"
                : isYours && !isCorrect
                ? "border-rose-400 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/40"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800";
              const textCls = isCorrect
                ? "font-semibold text-emerald-700 dark:text-emerald-300"
                : isYours
                ? "text-rose-700 dark:text-rose-300"
                : "text-slate-600 dark:text-slate-400";
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${cls}`}>
                  <span className="w-4 shrink-0 text-xs font-bold text-slate-500">
                    {OPTION_LABELS[i]}
                  </span>
                  <span className={`flex-1 text-sm ${textCls}`}>{opt}</span>
                  {isCorrect && <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />}
                  {isYours && !isCorrect && <XCircle size={14} className="shrink-0 text-rose-500" />}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {result.category}
            </span>
            <span className="rounded-lg bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              {result.difficulty}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TestResultPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const result      = location.state?.result;
  const testTitle   = location.state?.testTitle   ?? "Assessment Results";
  const retakeUrl   = location.state?.retakeUrl   ?? "/practice/mock-tests/dsa";
  const retakeState = location.state?.retakeState ?? null;

  if (!result) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
        <p className="text-slate-500 dark:text-slate-400">No result data found.</p>
        <button
          onClick={() => navigate("/practice/mock-tests")}
          className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const wrong   = result.results.filter((r) => r.yourAnswer != null && !r.correct).length;
  const skipped = result.results.filter((r) => r.yourAnswer == null).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6">
        <button
          onClick={() => navigate("/practice/mock-tests")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={16} />
          All Tests
        </button>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{testTitle}</span>
        <button
          onClick={() => navigate(retakeUrl, retakeState ? { state: retakeState } : undefined)}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 transition-colors hover:underline"
        >
          <RotateCcw size={13} />
          Retake
        </button>
      </div>

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <ScoreRing score={result.score} total={result.total} />

            <div className="flex-1 w-full">
              <div className="mb-1 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Test Complete!</h2>
              </div>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                {testTitle} · {result.total} questions · {result.accuracy}% accuracy
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3 text-center">
                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{result.score}</p>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Correct</p>
                </div>
                <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3 text-center">
                  <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{wrong}</p>
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">Wrong</p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-center">
                  <p className="text-xl font-extrabold text-slate-600 dark:text-slate-300">{skipped}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Skipped</p>
                </div>
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3 text-center">
                  <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatTime(result.timeTaken)}
                  </p>
                  <p className="flex items-center justify-center gap-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    <Clock size={10} /> Time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(result.categoryBreakdown).length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Category Breakdown</h3>
            <div className="space-y-3.5">
              {Object.entries(result.categoryBreakdown).map(([cat, stats]) => {
                const pct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
                const barColor =
                  pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";
                return (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {stats.correct}/{stats.total} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Answer Review</h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 size={12} /> {result.score}
              </span>
              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                <XCircle size={12} /> {wrong}
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold">
                <MinusCircle size={12} /> {skipped}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {result.results.map((r, i) => (
              <QuestionReviewItem key={r.id} result={r} index={i} />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <button
            onClick={() => navigate("/practice/mock-tests")}
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            All Tests
          </button>
          <button
            onClick={() => navigate(retakeUrl, retakeState ? { state: retakeState } : undefined)}
            className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-colors hover:bg-indigo-700"
          >
            Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}
