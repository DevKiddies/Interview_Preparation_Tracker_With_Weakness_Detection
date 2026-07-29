// QuizQuestionCard.jsx — renders a single MCQ.
// Category/difficulty are now plain text labels, not colored chips — they're
// metadata, not something that needs to compete visually with the question.
// Question text uses a serif face so the reading surface feels like an
// exam paper rather than app chrome; options stay sans for clarity.

import { Check } from "lucide-react";

const LABELS = ["A", "B", "C", "D"];

export default function QuizQuestionCard({ question, index, total, selectedOption, onSelect }) {
    return (
        <div className="flex-1 mb-6">
            {/* Meta row — plain text, no color */}
            <div className="mb-6 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {question.category} &middot; {question.difficulty}
        </span>
                <span className="text-[11px] font-medium text-zinc-400 tabular-nums">
          {index + 1} / {total}
        </span>
            </div>

            {/* Question text */}
            <h2 className="mb-7 text-lg sm:text-xl leading-relaxed text-zinc-900" style={{ fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif" }}>
                {question.text}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
                {question.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    return (
                        <button
                            key={idx}
                            onClick={() => onSelect(option)}
                            className={`group flex items-center gap-4 rounded-lg border px-4 py-3.5 text-left transition-colors duration-100 ${
                                isSelected
                                    ? "border-zinc-900 bg-zinc-50"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/60"
                            }`}
                        >
                            {/* Letter badge */}
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                                    isSelected
                                        ? "bg-zinc-900 text-white"
                                        : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
                                }`}
                            >
                {LABELS[idx]}
              </span>

                            {/* Option text */}
                            <span className={`flex-1 text-[14px] leading-snug ${isSelected ? "text-zinc-900 font-medium" : "text-zinc-700"}`}>
                {option}
              </span>

                            {isSelected && (
                                <Check size={16} className="shrink-0 text-zinc-900" strokeWidth={2.5} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}