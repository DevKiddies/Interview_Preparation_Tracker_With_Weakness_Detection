// QuizSidebarNavigator.jsx — question palette.
// Answered and flagged are independent states: a question can be both.
//   answered  = solid ink fill (a selection exists)
//   flagged   = ink outline ring (marked for review, regardless of answer)
//   visited   = any question the user has landed on (answered, flagged, or
//               left blank) — used for the "skipped" vs "not visited" legend.
//   unvisited = plain bordered square
// This keeps the grid genuinely monochrome while remaining scannable.

import { Flag, X } from "lucide-react";

export default function QuizSidebarNavigator({ total, currentIndex, selectedAnswers, flagged, onNavigate, isOpen, onClose }) {
    const answeredCount = Object.keys(selectedAnswers).length;
    const flaggedCount  = Object.values(flagged).filter(Boolean).length;
    const visitedCount  = new Set([
        ...Object.keys(selectedAnswers),
        ...Object.keys(flagged).filter((k) => flagged[k]),
        ...(currentIndex !== undefined ? [String(currentIndex)] : []),
    ]).size;
    const skippedCount  = visitedCount - answeredCount;
    const notVisited    = total - visitedCount;
    const progressPct   = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

    const isAnswered = (idx) => !!selectedAnswers[idx];
    const isFlagged  = (idx) => !!flagged[idx];

    const getBtnCls = (idx) => {
        if (idx === currentIndex)
            return "border-2 border-zinc-900 bg-white text-zinc-900 dark:border-slate-400 dark:bg-slate-800 dark:text-white";
        if (isAnswered(idx)) return "bg-zinc-900 text-white border border-zinc-900 dark:bg-slate-300 dark:text-slate-900 dark:border-slate-300";
        if (isFlagged(idx))  return "bg-white text-zinc-900 border-2 border-zinc-500 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-400";
        return "bg-white text-zinc-400 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-600 dark:bg-slate-900 dark:text-slate-500 dark:border-slate-700 dark:hover:border-slate-500 dark:hover:text-slate-300";
    };

    const content = (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="mb-5 flex shrink-0 items-center justify-between">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-slate-500">
                    Navigator
                </h4>
                <button
                    onClick={onClose}
                    className="lg:hidden rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="mb-5 shrink-0">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400 dark:text-slate-500">Completed</span>
                    <span className="font-medium text-zinc-700 tabular-nums dark:text-slate-300">{answeredCount} / {total}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                    <div
                        className="h-full rounded-full bg-zinc-900 transition-all duration-500 dark:bg-slate-300"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
            </div>

            {/* Legend with live counts — shape-based, not color-based */}
            <div className="mb-5 grid grid-cols-2 gap-y-2 gap-x-2 shrink-0">
                {[
                    { cls: "bg-zinc-900 border border-zinc-900 dark:bg-slate-300 dark:border-slate-300", label: "Answered", count: answeredCount },
                    { cls: "bg-white border-2 border-zinc-500 dark:bg-slate-800 dark:border-slate-400",  label: "Flagged",  count: flaggedCount  },
                    { cls: "bg-zinc-100 border border-zinc-200 dark:bg-slate-800 dark:border-slate-700", label: "Skipped",  count: skippedCount  },
                    { cls: "bg-white border border-zinc-200 dark:bg-slate-900 dark:border-slate-700",    label: "Not visited", count: notVisited },
                ].map(({ cls, label, count }) => (
                    <div key={label} className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-slate-400">
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${cls}`} />
                        <span>{label} <span className="font-medium text-zinc-700 tabular-nums dark:text-slate-300">({count})</span></span>
                    </div>
                ))}
            </div>

            {/* Question number grid */}
            <div className="grid flex-1 auto-rows-min grid-cols-5 gap-1.5 overflow-y-auto p-0.5">
                {Array.from({ length: total }).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { onNavigate(idx); onClose?.(); }}
                        className={`relative flex aspect-square items-center justify-center rounded-md text-xs font-semibold transition-colors duration-100 ${getBtnCls(idx)}`}
                    >
                        {idx + 1}
                        {isFlagged(idx) && (
                            <Flag
                                size={8}
                                strokeWidth={3}
                                className={`absolute right-0.5 top-0.5 ${
                                    isAnswered(idx)
                                        ? "text-zinc-100 dark:text-slate-900"
                                        : "text-zinc-500 dark:text-slate-400"
                                }`}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop */}
            <div className="hidden lg:flex w-60 shrink-0 flex-col border-l border-zinc-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                {content}
            </div>

            {/* Mobile slide-over drawer */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
                    <div className="relative flex w-72 max-w-[85vw] flex-col border-l border-zinc-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                        {content}
                    </div>
                </div>
            )}
        </>
    );
}