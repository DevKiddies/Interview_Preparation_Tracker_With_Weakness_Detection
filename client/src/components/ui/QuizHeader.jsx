// QuizHeader.jsx — fixed top bar shown during a mock test.
// Displays the test title, live answer/flagged/unanswered counts, a countdown
// timer, and a Finish button. The timer changes colour to warn the user as time runs low.

import { CheckCircle2, Flag, XCircle, Clock, LayoutGrid } from "lucide-react";

export default function QuizHeader({ timeLeft, total, statuses, title, subtitle, onFinish, onToggleSidebar }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount    = statuses.filter((s) => s === "answered").length;
  const flaggedCount     = statuses.filter((s) => s === "flagged").length;
  const notAnsweredCount = total - answeredCount;

  // Timer turns amber under 5 minutes, pulsing red under 1 minute — gives
  // the user a visual heads-up before time expires.
  const timerCls =
    timeLeft < 60
      ? "border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse"
      : timeLeft < 300
      ? "border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white";

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* Left: toggle + title */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
            aria-label="Toggle question navigator"
          >
            <LayoutGrid size={16} />
          </button>
        )}
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {title ?? "Mock Assessment"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle ?? "Practice"} &bull; {total} Questions
          </p>
        </div>
      </div>

      {/* Right: stats + timer + finish */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
            <CheckCircle2 size={13} />
            {answeredCount} Answered
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            <Flag size={13} />
            {flaggedCount} Flagged
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
            <XCircle size={13} />
            {notAnsweredCount} Not Answered
          </span>
        </div>

        <div className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold transition-colors duration-300 ${timerCls}`}>
          <Clock size={14} />
          {formatTime(timeLeft)}
        </div>

        <button
          onClick={onFinish}
          className="inline-flex items-center rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-sm shadow-rose-500/20"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
