import { useState } from "react";
import { CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp } from "lucide-react";

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuestionReviewCard({ result, index }) {
  const [open, setOpen] = useState(false);
  const skipped = result.yourAnswer == null;
  const correct = result.correct;

  const StatusIcon = skipped
    ? MinusCircle
    : correct
    ? CheckCircle2
    : XCircle;

  const statusColor = skipped
    ? "text-zinc-300"
    : correct
    ? "text-emerald-500"
    : "text-rose-500";

  const borderColor = skipped
    ? "border-zinc-200 dark:border-zinc-700"
    : correct
    ? "border-emerald-200 dark:border-emerald-500/30"
    : "border-rose-200 dark:border-rose-500/30";

  const statusBg = skipped
    ? "bg-zinc-50 dark:bg-zinc-800"
    : correct
    ? "bg-emerald-50 dark:bg-emerald-500/5"
    : "bg-rose-50 dark:bg-rose-500/5";

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${borderColor}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${statusBg}`}
      >
        <span className="w-6 shrink-0 text-center text-xs font-bold text-zinc-400">
          Q{index + 1}
        </span>
        <StatusIcon size={16} className={`shrink-0 ${statusColor}`} />
        <span className="flex-1 line-clamp-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {result.text}
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-lg border border-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400 sm:inline">
            {result.difficulty}
          </span>
          {open
            ? <ChevronUp size={14} className="shrink-0 text-zinc-400" />
            : <ChevronDown size={14} className="shrink-0 text-zinc-400" />
          }
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-800/30">
          <p className="mb-3 text-sm font-medium text-zinc-700 leading-relaxed dark:text-zinc-300">
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
                : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800";
              const textCls = isCorrect
                ? "font-semibold text-emerald-700 dark:text-emerald-300"
                : isYours
                ? "text-rose-700 dark:text-rose-300"
                : "text-zinc-600 dark:text-zinc-400";
              return (
                <div key={i} className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${cls}`}>
                  <span className="w-4 shrink-0 text-xs font-bold text-zinc-500">
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
            <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
              {result.category}
            </span>
            <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
              {result.difficulty}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
