import { CalendarDays } from "lucide-react";

const TARGET_LABELS = {
  faang: "FAANG / Big Tech",
  product: "Product Companies",
  service: "Service Companies",
  competitive: "Competitive Exams",
};

const EXPERIENCE_LABELS = {
  fresher: "Student / Fresher",
  mid: "Mid-level",
  senior: "Senior",
};

const THEME_STYLES = {
  COMPLETED: {
    bg: "from-emerald-600 to-teal-500 dark:from-emerald-700 dark:to-teal-600",
    textTitle: "text-emerald-100",
    badge: "bg-white/20 text-white backdrop-blur-xs",
    glow: "ring-1 ring-emerald-400 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.4)]",
    divider: "bg-emerald-400/30"
  },
  ACTIVE: {
    bg: "from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600",
    textTitle: "text-blue-100",
    badge: "bg-white/20 text-white backdrop-blur-xs",
    glow: "ring-1 ring-blue-400 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.4)]",
    divider: "bg-blue-400/30"
  },
  ARCHIVED: {
    bg: "from-slate-600 to-slate-500 dark:from-slate-700 dark:to-slate-600",
    textTitle: "text-slate-200",
    badge: "bg-white/20 text-white backdrop-blur-xs",
    glow: "ring-1 ring-slate-400 shadow-[0_4px_20px_-2px_rgba(100,116,139,0.4)]",
    divider: "bg-slate-400/30"
  },
};

function InterviewSummaryCard({ targetCompany, experienceLevel, interviewDate, status }) {
  const currentStatus = status || "ACTIVE";
  const theme = THEME_STYLES[currentStatus] || THEME_STYLES.ACTIVE;

  const formattedDate = interviewDate
      ? new Date(interviewDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : null;

  return (
      <div className={`w-full rounded-xl bg-gradient-to-r ${theme.bg} p-3.5 ${theme.glow}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

          {/* Left/Top Content: Heading Stack */}
          <div className="min-w-0">
            <p className={`text-[9px] font-black uppercase tracking-widest ${theme.textTitle} opacity-80 mb-0.5`}>
              Preparing For
            </p>
            <h2 className="truncate text-base font-black text-white tracking-tight">
              {TARGET_LABELS[targetCompany] || targetCompany || "Interview Prep"}
            </h2>
          </div>

          {/* Right/Bottom Content: Meta Details & Badge Row */}
          <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
            {(experienceLevel || formattedDate) && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-white/90">
                  {experienceLevel && (
                      <span>{EXPERIENCE_LABELS[experienceLevel] || experienceLevel}</span>
                  )}

                  {experienceLevel && formattedDate && (
                      <span className={`h-3 w-px ${theme.divider}`} aria-hidden="true" />
                  )}

                  {formattedDate && (
                      <div className="flex items-center gap-1 text-white/80">
                        <CalendarDays size={13} strokeWidth={2.5} />
                        <span>{formattedDate}</span>
                      </div>
                  )}
                </div>
            )}

            {status && (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${theme.badge}`}>
              {status === "COMPLETED" ? "Completed" : status === "ACTIVE" ? "Active" : "Archived"}
            </span>
            )}
          </div>

        </div>
      </div>
  );
}

export default InterviewSummaryCard;