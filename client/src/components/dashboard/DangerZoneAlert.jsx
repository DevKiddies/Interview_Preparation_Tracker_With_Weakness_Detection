import { AlertTriangle, ArrowRight } from "lucide-react";

export default function DangerZoneAlert({ topic, message, onFix }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-5 dark:border-rose-500/20 dark:bg-rose-500/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white">
          <AlertTriangle size={22} />
        </span>
        <div>
          <p className="font-bold text-rose-600 dark:text-rose-400">
            Danger Zone · {topic}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onFix}
        className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-600 active:scale-95"
      >
        Fix it
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
