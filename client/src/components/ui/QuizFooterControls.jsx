// QuizFooterControls.jsx — bottom action bar for the quiz question view.
// Contains Prev/Next navigation, a Flag toggle (marks for review), and
// a Clear button that only appears once the user has selected an answer.

import { ChevronLeft, ChevronRight, Flag, RotateCcw } from "lucide-react";

export default function QuizFooterControls({
  onPrev, onFlag, onSaveNext, onClear,
  isFirst, isLast, isFlagged, hasAnswer,
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 mt-auto gap-3 transition-colors duration-200">
      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={isFirst}
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Centre: Clear + Flag */}
      <div className="flex items-center gap-2">
        {hasAnswer && (
          <button
            onClick={onClear}
            title="Clear selection"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        <button
          onClick={onFlag}
          className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
            isFlagged
              ? "border-amber-400 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
              : "border-amber-300 dark:border-amber-600/50 bg-transparent text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
          }`}
        >
          <Flag size={14} />
          {isFlagged ? "Flagged" : "Flag"}
        </button>
      </div>

      {/* Save & Next */}
      <button
        onClick={onSaveNext}
        className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all"
      >
        {isLast ? (
          "Save"
        ) : (
          <>
            <span className="sm:hidden">Next</span>
            <span className="hidden sm:inline">Save &amp; Next</span>
            <ChevronRight size={16} />
          </>
        )}
      </button>
    </div>
  );
}
