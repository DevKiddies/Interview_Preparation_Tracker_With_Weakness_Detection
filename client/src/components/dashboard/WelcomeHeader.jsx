// WelcomeHeader.jsx — top section of the dashboard showing the user's name,
// goal/experience tags, days-to-interview countdown, and a quick "Start Test" button.

import { Clock, Zap } from "lucide-react";

export default function WelcomeHeader({ firstName, daysLeft, targetLabel, experienceLabel, onStartTest }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {firstName || "there"}! <span className="align-middle">👋</span>
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {targetLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              🎯 {targetLabel}
            </span>
          )}
          {experienceLabel && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {experienceLabel}
            </span>
          )}
          {!targetLabel && !experienceLabel && (
            <p className="text-slate-500 dark:text-slate-400">
              Here's your interview preparation overview for today.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <Clock size={16} className="text-slate-400" />
          <span className="text-slate-900 dark:text-white">{daysLeft ?? "—"}</span>
          <span className="font-medium text-slate-500 dark:text-slate-400">days to interview</span>
        </div>
        <button
          type="button"
          onClick={onStartTest}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:scale-95"
        >
          <Zap size={16} />
          Start Test
        </button>
      </div>
    </div>
  );
}
