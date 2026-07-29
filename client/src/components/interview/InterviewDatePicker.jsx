import { useMemo } from "react";

function InterviewDatePicker({ value, onChange }) {
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const daysLeft = useMemo(() => {
    if (!value) return null;
    const target = new Date(value);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 3600 * 24));
    return diff >= 0 ? diff : -1;
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val && val < todayStr) return;
    onChange(val);
  };

  return (
    <div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
        Interview Date
      </h2>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={value || ""}
          min={todayStr}
          onChange={handleChange}
          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        {daysLeft !== null && daysLeft >= 0 && (
          <span className="shrink-0 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full">
            {daysLeft === 0 ? "Today!" : `${daysLeft}d left`}
          </span>
        )}
      </div>
    </div>
  );
}

export default InterviewDatePicker;
