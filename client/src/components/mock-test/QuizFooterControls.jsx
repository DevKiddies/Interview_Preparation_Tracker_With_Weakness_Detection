// QuizFooterControls.jsx — bottom action bar for the quiz question view.
// Flag is now an outline toggle in ink, not amber — it earns visual weight
// only via a filled state change, not a competing color.

import { ChevronLeft, ChevronRight, Flag, RotateCcw } from "lucide-react";

export default function QuizFooterControls({
                                               onPrev, onFlag, onSaveNext, onClear,
                                               isFirst, isLast, isFlagged, hasAnswer,
                                           }) {
    return (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 mt-auto gap-3 dark:border-slate-800">
            {/* Prev */}
            <button
                onClick={onPrev}
                disabled={isFirst}
                className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-35 disabled:cursor-not-allowed transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
                <ChevronLeft size={15} />
                <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Centre: Clear + Flag */}
            <div className="flex items-center gap-2">
                {hasAnswer && (
                    <button
                        onClick={onClear}
                        title="Clear selection"
                        className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <RotateCcw size={13} />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                )}

                <button
                    onClick={onFlag}
                    className={`flex items-center gap-1.5 rounded-md border px-4 py-2.5 text-[13px] font-medium transition-colors ${
                        isFlagged
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-slate-600 dark:bg-slate-700"
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                >
                    <Flag size={13} />
                    {isFlagged ? "Flagged" : "Flag For Review"}
                </button>
            </div>

            {/* Save & Next */}
            <button
                onClick={onSaveNext}
                className="flex items-center gap-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 px-5 py-2.5 text-[13px] font-medium text-white transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
            >
                {isLast ? (
                    "Submit"
                ) : (
                    <>
                        <span className="sm:hidden">Next</span>
                        <span className="hidden sm:inline">Save And Next</span>
                        <ChevronRight size={15} />
                    </>
                )}
            </button>
        </div>
    );
}