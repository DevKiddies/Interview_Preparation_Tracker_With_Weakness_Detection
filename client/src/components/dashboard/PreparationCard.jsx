import { CalendarDays, Clock3, AlertCircle, Play } from "lucide-react";

export default function PreparationCard({
                                            targetLabel,
                                            experienceLabel,
                                            daysLeft,
                                            interviewDate,
                                            focusTopics = [],
                                            onStartTest,
                                        }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* Left Side: Info Elements */}
                <div className="flex-1 space-y-3">
                    <div>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Preparing For
                        </p>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {targetLabel || "Interview Preparation"}
                        </h2>
                        {experienceLabel && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {experienceLabel}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <CalendarDays size={14} />
                        <span>
              {interviewDate
                  ? new Date(interviewDate).toLocaleDateString()
                  : "Interview date not set"}
            </span>
                    </div>

                    {focusTopics.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                                <AlertCircle size={14} />
                                <span className="text-xs font-semibold">
                  {focusTopics.length} Weak {focusTopics.length === 1 ? "Topic" : "Topics"}
                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {focusTopics.map((topic) => (
                                    <span
                                        key={topic}
                                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                    >
                    {topic}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Equal-sized Square Blocks */}
                <div className="flex items-center justify-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:border-t-0 sm:pt-0 shrink-0">

                    {/* Days Left Square */}
                    <div className="flex flex-col items-center justify-center rounded-xl dark:border-indigo-500/20 dark:bg-indigo-500/10 w-16 h-16 sm:w-20 sm:h-20 shrink-0">
            <span className="text-lg sm:text-2xl font-black text-indigo-700 dark:text-indigo-300 leading-none">
              {daysLeft ?? "--"}
            </span>
                        <span className="mt-0.5 text-[10px] sm:text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-tight">
              Days Left
            </span>
                    </div>

                    {/* Action Button Square */}
                    <button
                        onClick={onStartTest}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 w-16 h-16 sm:w-20 sm:h-20 shrink-0 group"
                    >
                        <Play size={14} fill="currentColor" className="transition transform group-hover:scale-110" />
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-tight">
              Start
            </span>
                    </button>
                </div>

            </div>
        </div>
    );
}