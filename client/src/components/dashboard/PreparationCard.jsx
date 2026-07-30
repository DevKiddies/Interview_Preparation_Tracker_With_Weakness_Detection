// PreparationCard.jsx — Universal "Current Interview" widget used across Dashboard & Interview pages.

import { CalendarDays, AlertCircle } from "lucide-react";

const STATUS_STYLES = {
    ACTIVE: {
        container: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        daysBg: "bg-indigo-50 border-indigo-100 dark:border-indigo-500/20 dark:bg-indigo-500/10",
        daysText: "text-indigo-700 dark:text-indigo-300",
        daysSubtext: "text-indigo-500 dark:text-indigo-400",
        actionBtn: "bg-indigo-600 text-white hover:bg-indigo-700",
    },
    COMPLETED: {
        container: "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800/60 dark:bg-emerald-950/20",
        daysBg: "bg-emerald-100/80 border-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/10",
        daysText: "text-emerald-700 dark:text-emerald-300",
        daysSubtext: "text-emerald-600 dark:text-emerald-400",
        actionBtn: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    UPCOMING: {
        container: "border-amber-200 bg-amber-50/30 dark:border-amber-800/60 dark:bg-amber-950/20",
        daysBg: "bg-amber-100/80 border-amber-200 dark:border-amber-500/20 dark:bg-amber-500/10",
        daysText: "text-amber-700 dark:text-amber-300",
        daysSubtext: "text-amber-600 dark:text-amber-400",
        actionBtn: "bg-amber-600 text-white hover:bg-amber-700",
    },
    EMPTY: {
        container: "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50",
        daysBg: "bg-slate-100 border-slate-200 dark:border-slate-800 dark:bg-slate-800/50",
        daysText: "text-slate-400 dark:text-slate-500",
        daysSubtext: "text-slate-400 dark:text-slate-500",
        actionBtn: "bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600",
    },
};

export default function PreparationCard({
                                            targetLabel,
                                            experienceLabel,
                                            daysLeft,
                                            interviewDate,
                                            focusTopics = [],
                                            status = "ACTIVE",
                                            action, // { label: string, icon: ReactNode, onClick: () => void, disabled?: boolean }
                                        }) {
    const styles = STATUS_STYLES[status] || STATUS_STYLES.ACTIVE;

    const titleText =
        status === "COMPLETED"
            ? "Interview Complete"
            : targetLabel || "Interview Preparation";

    return (
        <div
            className={`rounded-xl border p-4 shadow-sm transition-colors duration-200 ${styles.container}`}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Left Side: Info Elements */}
                <div className="flex-1 space-y-3">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {status === "COMPLETED" ? "Target Achieved" : "Preparing For"}
                        </p>
                        <h2 className="text-lg font-bold leading-snug text-slate-900 dark:text-white">
                            {titleText}
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
                  ? new Date(interviewDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                  })
                  : "Interview date not set"}
            </span>
                    </div>

                    {focusTopics.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                                <AlertCircle size={14} />
                                <span className="text-xs font-semibold">
                  {focusTopics.length} Weak{" "}
                                    {focusTopics.length === 1 ? "Topic" : "Topics"}
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
                <div className="flex shrink-0 items-center justify-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 sm:border-t-0 sm:pt-0">
                    {/* Days Left / Status Square */}
                    <div
                        className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border sm:h-20 sm:w-20 ${styles.daysBg}`}
                    >
            <span
                className={`text-lg font-black leading-none sm:text-2xl ${styles.daysText}`}
            >
              {status === "COMPLETED"
                  ? "✓"
                  : daysLeft !== null && daysLeft !== undefined
                      ? daysLeft
                      : "--"}
            </span>
                        <span
                            className={`mt-0.5 text-[10px] font-semibold uppercase tracking-tight sm:text-xs ${styles.daysSubtext}`}
                        >
              {status === "COMPLETED"
                  ? "Done"
                  : daysLeft === 0
                      ? "Today"
                      : "Days Left"}
            </span>
                    </div>

                    {/* Generic Action Button Square */}
                    {action && (
                        <button
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`group flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl transition disabled:opacity-50 sm:h-20 sm:w-20 ${styles.actionBtn}`}
                        >
                            {action.icon && (
                                <span className="transition transform group-hover:scale-110">
                  {action.icon}
                </span>
                            )}
                            <span className="text-center text-[10px] font-semibold uppercase tracking-tight sm:text-xs">
                {action.label}
              </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}