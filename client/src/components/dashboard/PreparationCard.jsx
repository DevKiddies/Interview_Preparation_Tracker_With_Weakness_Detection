// PreparationCard.jsx — Universal "Current Interview" widget used across Dashboard & Interview pages.

import React, { cloneElement, isValidElement } from "react";
import { CalendarDays } from "lucide-react";

const THEME_STYLES = {
    COMPLETED: {
        bg: "from-emerald-600 to-teal-500 dark:from-emerald-700 dark:to-teal-600",
        textTitle: "text-emerald-100",
        badge: "bg-white/20 text-white backdrop-blur-xs",
        glow: "ring-1 ring-emerald-400 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.4)]",
        divider: "bg-emerald-400/30",
    },
    ACTIVE: {
        bg: "from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600",
        textTitle: "text-blue-100",
        badge: "bg-white/20 text-white backdrop-blur-xs",
        glow: "ring-1 ring-blue-400 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.4)]",
        divider: "bg-blue-400/30",
    },
    UPCOMING: {
        bg: "from-amber-600 to-orange-500 dark:from-amber-700 dark:to-orange-600",
        textTitle: "text-amber-100",
        badge: "bg-white/20 text-white backdrop-blur-xs",
        glow: "ring-1 ring-amber-400 shadow-[0_4px_20px_-2px_rgba(245,158,11,0.4)]",
        divider: "bg-amber-400/30",
    },
    EMPTY: {
        bg: "from-slate-600 to-slate-500 dark:from-slate-700 dark:to-slate-600",
        textTitle: "text-slate-200",
        badge: "bg-white/20 text-white backdrop-blur-xs",
        glow: "ring-1 ring-slate-400 shadow-[0_4px_20px_-2px_rgba(100,116,139,0.4)]",
        divider: "bg-slate-400/30",
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
    const theme = THEME_STYLES[status] || THEME_STYLES.ACTIVE;

    const titleText =
        status === "COMPLETED"
            ? "INTERVIEW COMPLETE"
            : (targetLabel || "INTERVIEW PREPARATION").toUpperCase();

    const formattedDate = interviewDate
        ? new Date(interviewDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : null;

    const showDaysBlock = status !== "EMPTY" || daysLeft !== null;
    const daysValue =
        status === "COMPLETED"
            ? "✓"
            : daysLeft !== null && daysLeft !== undefined
                ? daysLeft
                : "--";
    const daysLabel =
        status === "COMPLETED"
            ? "DONE"
            : daysLeft === 0
                ? "TODAY"
                : "DAYS LEFT";

    return (
        <div className={`w-full rounded-xl bg-gradient-to-r ${theme.bg} p-4 ${theme.glow}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">

                {/* Left / Top: Heading + Meta */}
                <div className="min-w-0 flex-1 space-y-2.5">
                    <div>
                        <p className={`mb-0.5 text-[9px] font-black uppercase tracking-widest ${theme.textTitle} opacity-80`}>
                            {status === "COMPLETED" ? "TARGET ACHIEVED" : "PREPARING FOR"}
                        </p>
                        <h2 className="truncate text-base font-black tracking-tight uppercase text-white">
                            {titleText}
                        </h2>
                    </div>

                    {/* Styled Uppercase Date Pill */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-white/90">
                        {formattedDate && (
                            <div className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-white shadow-xs backdrop-blur-xs">
                                <CalendarDays size={13} strokeWidth={2.5} className="opacity-90" />
                                <span>{formattedDate}</span>
                            </div>
                        )}
                    </div>

                    {focusTopics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wide ${theme.textTitle} opacity-80`}>
                {focusTopics.length} WEAK {focusTopics.length === 1 ? "TOPIC" : "TOPICS"}
              </span>
                            <div className="flex flex-wrap gap-1">
                                {focusTopics.map((topic) => (
                                    <span
                                        key={topic}
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${theme.badge}`}
                                    >
                    {topic}
                  </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right / Bottom: Full-Height Days Block + Scaled Action Button */}
                <div className="flex shrink-0 items-stretch justify-center gap-3 self-stretch">
                    {showDaysBlock && (
                        <div className="flex min-h-[72px] w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-white/15 p-2 ring-1 ring-white/20 backdrop-blur-sm">
                            <span className="text-2xl font-black leading-none text-white">{daysValue}</span>
                            <span className="mt-0 text-center text-[11px] font-black uppercase tracking-tight text-white">
                {daysLabel}
              </span>
                        </div>
                    )}

                    {action && (
                        <button
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className="group flex min-h-[72px] w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl bg-white/15 p-2 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-50"
                        >
                            {action.icon && (
                                <span className="transition-transform group-hover:scale-110">
                  {isValidElement(action.icon)
                      ? cloneElement(action.icon, { size: 20, strokeWidth: 2.5 })
                      : action.icon}
                </span>
                            )}
                            <span className="text-center text-[12px] font-black uppercase tracking-tight">
                {action.label}
              </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}