// QuizSidebarNavigator.jsx — question palette showing the status (answered/flagged/
// skipped/unvisited) of every question as coloured numbered buttons.
// On desktop it's a permanent right panel; on mobile it slides in as a drawer.

import { X } from "lucide-react";

export default function QuizSidebarNavigator({ total, currentIndex, statuses, onNavigate, isOpen, onClose }) {
  const answeredCount = statuses.filter((s) => s === "answered").length;
  const flaggedCount  = statuses.filter((s) => s === "flagged").length;
  const skippedCount  = statuses.filter((s) => s === "skipped").length;
  const progressPct   = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const getBtnCls = (status, idx) => {
    if (idx === currentIndex)
      return "ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-slate-900 bg-blue-600 text-white";
    if (status === "answered") return "bg-emerald-500 text-white";
    if (status === "flagged")  return "bg-amber-500 text-white";
    if (status === "skipped")  return "bg-rose-500 text-white";
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400";
  };

  const content = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Navigator
        </h4>
        <button
          onClick={onClose}
          className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4 shrink-0">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">Completed</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{answeredCount} / {total}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-linear-to-r from-blue-500 to-teal-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Legend with live counts */}
      <div className="mb-4 grid grid-cols-2 gap-1.5 shrink-0">
        {[
          { color: "bg-emerald-500", label: "Answered", count: answeredCount },
          { color: "bg-amber-500",   label: "Flagged",  count: flaggedCount  },
          { color: "bg-rose-500",    label: "Skipped",  count: skippedCount  },
          { color: "bg-slate-300 dark:bg-slate-600", label: "Not Visited", count: total - answeredCount - flaggedCount - skippedCount },
        ].map(({ color, label, count }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${color}`} />
            <span>{label} <span className="font-bold text-slate-700 dark:text-slate-300">({count})</span></span>
          </div>
        ))}
      </div>

      {/* Question number grid */}
      <div className="grid flex-1 auto-rows-min grid-cols-5 gap-1.5 overflow-y-auto p-1">
        {Array.from({ length: total }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => { onNavigate(idx); onClose?.(); }}
            className={`flex aspect-square items-center justify-center rounded-xl text-xs font-bold transition-all duration-100 hover:scale-105 active:scale-95 ${getBtnCls(statuses[idx], idx)}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex w-60 shrink-0 flex-col border-l border-slate-200 dark:border-slate-700 bg-white p-4 dark:bg-slate-900 transition-colors duration-200">
        {content}
      </div>

      {/* Mobile slide-over drawer — clicking the backdrop dismisses it */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="relative flex w-72 max-w-[85vw] flex-col border-l border-slate-200 dark:border-slate-700 bg-white p-4 shadow-2xl dark:bg-slate-900">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
