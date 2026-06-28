// RecommendedForYou.jsx — dashboard card showing AI-curated study recommendations.
// Items are passed in as props so the parent (DashboardPage) controls the data source.
// The onStart callback lets the parent decide where each CTA navigates to.

import { BookOpen, PlayCircle, Code2 } from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

const ICONS = { book: BookOpen, play: PlayCircle, code: Code2 };

const ICON_TONES = {
  indigo: "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10",
  teal: "bg-teal-50 text-teal-500 dark:bg-teal-500/10",
  emerald: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10",
};

const BADGE_TONES = {
  indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
};

const CTA_TONES = {
  indigo: "bg-indigo-600 hover:bg-indigo-700",
  teal: "bg-teal-500 hover:bg-teal-600",
  emerald: "bg-emerald-500 hover:bg-emerald-600",
};

function RecommendationRow({ item, onStart }) {
  const Icon = ICONS[item.icon] ?? BookOpen;
  return (
    <div className="flex items-center gap-3 py-3">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ICON_TONES[item.badgeTone]}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
      </div>
      <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline ${BADGE_TONES[item.badgeTone]}`}>
        {item.badge}
      </span>
      <button
        type="button"
        onClick={() => onStart?.(item)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-all duration-200 active:scale-95 ${CTA_TONES[item.ctaTone]}`}
      >
        {item.cta}
      </button>
    </div>
  );
}

export default function RecommendedForYou({ items, onViewAll, onStart, footer }) {
  return (
    <DashboardCard
      title="Recommended for you"
      subtitle="Based on your performance"
      action={
        <button
          type="button"
          onClick={onViewAll}
          className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400"
        >
          View All
        </button>
      }
    >
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => (
          <RecommendationRow key={item.id} item={item} onStart={onStart} />
        ))}
      </div>

      {footer && (
        <>
          <div className="my-5 h-px bg-slate-100 dark:bg-slate-800" />
          {footer}
        </>
      )}
    </DashboardCard>
  );
}
