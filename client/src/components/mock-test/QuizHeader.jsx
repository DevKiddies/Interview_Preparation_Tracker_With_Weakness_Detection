// QuizHeader.jsx — fixed top bar shown during a mock test.
// Deliberately quiet: no colored stat pills, no alarming pulse on the timer.
// Status counts still live in the sidebar navigator, which is the single
// place the test-taker looks for progress — the header's only job is
// orientation (what test, how long left) and the one irreversible action.

import { Clock, LayoutGrid } from "lucide-react";

export default function QuizHeader({ timeLeft, totalTime, total, title, subtitle, onFinish, onToggleSidebar }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Timer stays visually calm at all times: no color swap, no pulse.
  // Urgency is conveyed only by a thin bar depleting under the number —
  // legible peripherally without demanding attention.
  const pct = totalTime > 0 ? Math.max(0, Math.min(1, timeLeft / totalTime)) : 0;
  const isLast5 = timeLeft < 300;

  return (
      <div className="flex items-center justify-between gap-4 px-5 sm:px-8 py-3.5 border-b border-zinc-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Left: toggle + title */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleSidebar && (
              <button
                  onClick={onToggleSidebar}
                  className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors shrink-0 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Toggle question navigator"
              >
                <LayoutGrid size={15} />
              </button>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900 truncate tracking-tight dark:text-white">
              {title ?? "Mock Assessment"}
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-slate-500">
              {subtitle ?? "Practice"} &middot; {total} questions
            </p>
          </div>
        </div>

        {/* Right: timer + finish */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1 w-[92px]">
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-800 tabular-nums dark:text-slate-200">
              <Clock size={13} className="text-zinc-400 dark:text-slate-500" strokeWidth={2} />
              {formatTime(timeLeft)}
            </div>
            <div className="h-[2px] w-7 rounded-full bg-zinc-100 dark:bg-slate-800 overflow-hidden">
              <div
                  className={`h-full rounded-full transition-all duration-500 ${isLast5 ? "bg-zinc-700 dark:bg-slate-300" : "bg-zinc-300 dark:bg-slate-600"}`}
                  style={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>

          <button
              onClick={onFinish}
              className="inline-flex items-center rounded-md border border-zinc-900 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 text-[13px] font-medium transition-colors dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            Submit Test
          </button>
        </div>
      </div>
  );
}