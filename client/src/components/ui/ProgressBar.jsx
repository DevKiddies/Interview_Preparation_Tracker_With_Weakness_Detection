// Labeled horizontal progress bar. The value tone follows simple thresholds
// (low = rose, mid = amber/indigo, high = emerald) unless `tone` is passed explicitly.
const TRACK = "h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800";

const FILL_TONES = {
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  teal: "bg-teal-500",
};

const TEXT_TONES = {
  rose: "text-rose-600 dark:text-rose-400",
  amber: "text-amber-600 dark:text-amber-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  teal: "text-teal-600 dark:text-teal-400",
};

function toneForValue(value) {
  if (value < 40) return "rose";
  if (value < 70) return "indigo";
  return "emerald";
}

export default function ProgressBar({ label, value, tone }) {
  const resolved = tone || toneForValue(value);

  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
          </span>
          <span className={`text-sm font-bold ${TEXT_TONES[resolved]}`}>{value}%</span>
        </div>
      )}
      <div className={TRACK}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${FILL_TONES[resolved]}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
