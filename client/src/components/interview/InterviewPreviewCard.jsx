import { useMemo } from "react";

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

function InterviewPreviewCard({ targetCompany, experienceLevel, interviewDate }) {
  const daysLeft = useMemo(() => {
    if (!interviewDate) return null;
    const target = new Date(interviewDate);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 3600 * 24));
    return diff >= 0 ? diff : 0;
  }, [interviewDate]);

  const formattedDate = useMemo(() => {
    if (!interviewDate) return null;
    return new Date(interviewDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [interviewDate]);

  const hasData = targetCompany || experienceLevel || interviewDate;

  if (!hasData) return null;

  return (
    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-linear-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-slate-900 p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-4">
        Current Goal
      </p>
      <div className="space-y-3">
        {targetCompany && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Preparing For
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {TARGET_LABELS[targetCompany] || targetCompany}
            </p>
          </div>
        )}

        {experienceLevel && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Experience
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {EXPERIENCE_LABELS[experienceLevel] || experienceLevel}
            </p>
          </div>
        )}

        {interviewDate && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Interview
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {formattedDate}
              </p>
            </div>
            {daysLeft !== null && (
              <div className="text-right">
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {daysLeft}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                  Days Left
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewPreviewCard;
