import { useMemo } from "react";
import { ArrowRight, Clock } from "lucide-react";

const TYPE_LABELS = {
  MOCK: "Mock Test",
  TOPIC: "Topic Test",
};

const ACCENT = {
  COMPLETED: "bg-emerald-500",
  ABANDONED: "bg-slate-300 dark:bg-slate-700",
};

const TYPE_BADGE_STYLES = {
  MOCK: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  TOPIC: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30",
};

function StatBlock({ label, value, icon, emphasis }) {
  return (
      <div className="min-w-0 flex items-center justify-between sm:flex-col sm:items-start">
        <p className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {icon}
          {label}
        </p>
        <p
            className={`truncate text-xs ${
                emphasis
                    ? "font-black text-slate-800 dark:text-slate-100"
                    : "font-semibold text-slate-600 dark:text-slate-300"
            }`}
        >
          {value}
        </p>
      </div>
  );
}

function MockTestCard({ test, onViewAnalysis }) {
  const formattedDate = useMemo(() => {
    if (!test.completedAt) return "";
    return new Date(test.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [test.completedAt]);

  return (
      <div className="group relative overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <div className={`absolute inset-y-0 left-0 w-1 ${ACCENT[test.status] || ACCENT.COMPLETED}`} />

        {/* Tightened overall padding to p-2.5 */}
        <div className="p-2.5 pl-3.5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-xs font-black text-slate-900 dark:text-white">
                  {test.title}
                </h3>
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${TYPE_BADGE_STYLES[test.type] || TYPE_BADGE_STYLES.MOCK}`}>
                  {TYPE_LABELS[test.type] || test.type}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formattedDate}</p>
            </div>

            <div className="shrink-0 flex items-baseline gap-1 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-black text-slate-900 dark:text-white">{test.score ?? "—"}</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">/{test.questionCount ?? "?"}</span>
            </div>
          </div>

          {/* Combined Stats Grid & Weak Topics wrapper */}
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-slate-50/60 p-2 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/40">
            {/* Stats Array */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-1 sm:grid-cols-4">
              <StatBlock label="Questions" value={test.questionCount ?? "—"} />
              <StatBlock label="Time" icon={<Clock size={9} />} value={test.duration != null ? `${test.duration}m` : "—"} />
              <StatBlock label="Confidence" value={test.confidence != null ? `${test.confidence}%` : "—"} emphasis />
              <StatBlock label="Accuracy" value={test.accuracy != null ? `${test.accuracy}%` : "—"} emphasis />
            </div>

            {/* Inlined action button inside the card block area */}
            <div className="shrink-0 border-t border-slate-200/50 pt-1.5 sm:border-t-0 sm:pt-0 sm:pl-3 flex justify-end">
              <button
                  onClick={() => onViewAnalysis?.(test)}
                  className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-2 py-1 text-[11px] font-bold text-indigo-600 shadow-2xs ring-1 ring-slate-200 dark:ring-slate-700 transition-colors hover:bg-slate-50 dark:text-indigo-400"
              >
                Analysis
                <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* Highly Compact Weak Topics ribbon */}
          {test.weakTopics?.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5 overflow-hidden">
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Weakest:
                </span>
                <div className="flex flex-wrap gap-1 truncate">
                  {test.weakTopics.map((t) => (
                      <span
                          key={t}
                          className="rounded px-1 text-[9px] font-semibold text-rose-600 bg-rose-50 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                      >
                        {t}
                      </span>
                  ))}
                </div>
              </div>
          )}
        </div>
      </div>
  );
}

export default MockTestCard;