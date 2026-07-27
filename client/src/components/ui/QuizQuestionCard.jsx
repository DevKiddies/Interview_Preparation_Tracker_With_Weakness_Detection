// QuizQuestionCard.jsx — renders a single MCQ with category/difficulty tags,
// the question text, and A–D option buttons. Highlights the selected option
// and shows a checkmark icon so the choice is visually unambiguous.

import { CheckCircle2 } from "lucide-react";

const LABELS = ["A", "B", "C", "D"];

export default function QuizQuestionCard({ question, index, total, selectedOption, onSelect }) {
  return (
    <div className="flex-1 mb-5">
      {/* Tags row */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            {question.category}
          </span>
          <span className="rounded-lg bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {question.difficulty}
          </span>
        </div>
        <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
          Q {index + 1} / {total}
        </span>
      </div>

      {/* Question text */}
      <h2 className="mb-6 text-base sm:text-lg font-semibold leading-relaxed text-slate-900 dark:text-white">
        {question.text}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          return (
            <button
              key={idx}
              onClick={() => onSelect(option)}
              className={`group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-150 active:scale-[0.99] ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10 shadow-sm shadow-blue-500/10"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              }`}
            >
              {/* Letter badge */}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-400"
                }`}
              >
                {LABELS[idx]}
              </span>

              {/* Option text */}
              <span className={`flex-1 text-sm font-medium ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-200"}`}>
                {option}
              </span>

              {/* Checkmark when selected */}
              {isSelected && (
                <CheckCircle2 size={18} className="shrink-0 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
