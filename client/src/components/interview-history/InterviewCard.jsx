import { useMemo } from "react";
import { ArrowRight, Calendar, Flame } from "lucide-react";

const TARGET_LABELS = {
  faang: "FAANG / Big Tech",
  product: "Product Companies",
  service: "Service Companies",
  competitive: "Competitive Exams",
};

const EXPERIENCE_LABELS = {
  fresher: "Student / Fresher",
  mid: "Mid-Level",
  senior: "Senior",
};

const ACCENT = {
  ACTIVE: "bg-indigo-500",
  COMPLETED: "bg-emerald-500",
  ARCHIVED: "bg-slate-300 dark:bg-slate-700",
};

const BADGE_STYLES = {
  ACTIVE: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
};

const STATUS_LABEL = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

function StatBlock({ label, value, emphasis }) {
  return (
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </p>
        <p
            className={`truncate text-xs ${
                emphasis
                    ? "font-bold text-slate-800 dark:text-slate-100"
                    : "font-medium text-slate-600 dark:text-slate-300"
            }`}
        >
          {value}
        </p>
      </div>
  );
}

function InterviewCard({ interview, onViewDetails, onContinue }) {
  const daysLeft = useMemo(() => {
    if (!interview.interviewDate) return null;
    const target = new Date(interview.interviewDate);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 3600 * 24));
    return diff >= 0 ? diff : 0;
  }, [interview.interviewDate]);

  const formattedStart = useMemo(() => {
    if (!interview.startDate) return "";
    return new Date(interview.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [interview.startDate]);

  const formattedEnd = useMemo(() => {
    if (!interview.interviewDate) return "";
    return new Date(interview.interviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [interview.interviewDate]);

  const isActive = interview.status === "ACTIVE";

  const handleCardClick = () => onViewDetails?.(interview);

  const handleCardKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
      <div
          onClick={handleCardClick}
          onKeyDown={handleCardKeyDown}
          role="button"
          tabIndex={0}
          className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-slate-700"
      >
        {/* Status accent stripe */}
        <div className={`absolute inset-y-0 left-0 w-1 ${ACCENT[interview.status] || ACCENT.ARCHIVED}`} />

        <div className="p-2.5 pl-3.5">
          {/* Header */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="truncate text-[13px] font-bold text-slate-900 dark:text-white">
                  {TARGET_LABELS[interview.targetCompany] || interview.targetCompany}
                </h3>
                <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                        BADGE_STYLES[interview.status] || BADGE_STYLES.ARCHIVED
                    }`}
                >
                {STATUS_LABEL[interview.status] || "Archived"}
              </span>
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Calendar size={10} className="shrink-0" />
                <span className="truncate">
                {formattedStart} → {formattedEnd}
                  {interview.duration ? ` · ${interview.duration}d` : ""}
              </span>
              </p>
            </div>

            {isActive && daysLeft !== null && (
                <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-1 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20">
                  <Flame size={11} />
                  <div className="text-right leading-tight">
                    <p className="text-[11px] font-extrabold">{daysLeft}</p>
                    <p className="text-[7px] font-semibold uppercase tracking-wide">
                      {daysLeft === 1 ? "day left" : "days left"}
                    </p>
                  </div>
                </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 rounded-md bg-slate-50 p-2 dark:bg-slate-800/50 sm:grid-cols-4">
            <StatBlock
                label="Experience"
                value={EXPERIENCE_LABELS[interview.experience] || interview.experience || "—"}
            />
            <StatBlock
                label="Questions"
                value={interview.questionsSolved?.toLocaleString() ?? "—"}
                emphasis
            />
            <StatBlock
                label="Confidence"
                value={interview.confidence != null ? `${interview.confidence}%` : "—"}
                emphasis
            />
            <StatBlock
                label="Accuracy"
                value={interview.accuracy != null ? `${interview.accuracy}%` : "—"}
                emphasis
            />
          </div>

          {/* Weak topics */}
          {interview.weakTopics?.length > 0 && (
              <div className="mt-2">
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Weakest Topics
                </p>
                <div className="flex flex-wrap gap-1">
                  {interview.weakTopics.map((t) => (
                      <span
                          key={t}
                          className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-medium text-rose-600 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                      >
                  {t}
                </span>
                  ))}
                </div>
              </div>
          )}

          {/* Footer action */}
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            {isActive ? (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContinue?.(interview);
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                >
                  Continue Preparation
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </button>
            ) : (
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(interview);
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  View Details
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </button>
            )}
          </div>
        </div>
      </div>
  );
}

export default InterviewCard;