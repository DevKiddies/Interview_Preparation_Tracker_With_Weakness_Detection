import { Clock, Zap } from "lucide-react";

export default function WelcomeHeader({ firstName, daysLeft, onStartTest }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {firstName}! <span className="align-middle">👋</span>
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Here's your interview preparation overview for today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <Clock size={16} className="text-slate-400" />
          <span className="text-slate-900 dark:text-white">{daysLeft}</span>
          <span className="font-medium text-slate-500 dark:text-slate-400">
            days to interview
          </span>
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
