// QuickActions.jsx — a small set of shortcut buttons shown at the bottom of the
// Activity Heatmap card. Lets users jump directly to common tasks without
// navigating through the full menu.

import { Link } from "react-router-dom";
import { BookOpen, Zap, Star, ArrowRight } from "lucide-react";

const ICONS = { book: BookOpen, zap: Zap, star: Star };

const TONES = {
  indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20",
  teal: "bg-teal-50 text-teal-600 hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20",
  amber: "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20",
};

export default function QuickActions({ actions }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Quick Actions
      </h4>
      <div className="flex flex-col gap-2.5">
        {actions.map((action) => {
          const Icon = ICONS[action.icon] ?? Star;
          return (
            <Link
              key={action.id}
              to={action.to}
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${TONES[action.tone]}`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {action.label}
              </span>
              <ArrowRight size={16} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
