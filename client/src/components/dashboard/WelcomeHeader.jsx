// WelcomeHeader.jsx — top section of the dashboard showing the user's name,
// goal/experience tags, days-to-interview countdown, and a quick "Start Test" button.

import { Clock, Zap } from "lucide-react";

const SUBTITLES = [
  "Your consistency is your superpower. Keep going.",
  "Every practice session brings you one step closer.",
  "Champions are made in the hours no one sees.",
  "Focus. Practice. Dominate the interview.",
  "The grind you put in today shapes tomorrow's offer.",
  "You're building something great — one problem at a time.",
  "Sharpen your skills. Your dream company is watching.",
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return { line: "Good morning,", emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { line: "Good afternoon,", emoji: "👋" };
  if (hour >= 17 && hour < 21) return { line: "Good evening,", emoji: "🌇" };
  return { line: "Hey there,", emoji: "🌙" };
}

export default function WelcomeHeader({ firstName, daysLeft, targetLabel, experienceLabel, onStartTest }) {
  const { line, emoji } = getGreeting();
  const subtitle = SUBTITLES[new Date().getDate() % SUBTITLES.length];
  const displayName = firstName || "there";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-col">
          <p className="text-base font-medium text-slate-400 dark:text-slate-500 tracking-wide leading-snug">
            {line} <span className="align-middle">{emoji}</span>
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight truncate leading-tight -mt-1 bg-linear-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            {displayName}!
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 italic mt-1">
            ✦ {subtitle}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
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
