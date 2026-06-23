import { Flame, CheckCircle2, Star, TrendingUp } from "lucide-react";

const ICONS = {
  flame: Flame,
  check: CheckCircle2,
  star: Star,
  trending: TrendingUp,
};

const ICON_TONES = {
  amber: "bg-amber-50 text-amber-500 dark:bg-amber-500/10",
  emerald: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10",
  indigo: "bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10",
  teal: "bg-teal-50 text-teal-500 dark:bg-teal-500/10",
};

const SUBLABEL_TONES = {
  positive: "text-emerald-600 dark:text-emerald-400",
  muted: "text-slate-400 dark:text-slate-500",
};

export default function StatCard({ label, value, sublabel, sublabelTone = "muted", icon, tone = "indigo" }) {
  const Icon = ICONS[icon] ?? Star;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${ICON_TONES[tone]}`}>
          <Icon size={20} />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          {label}
        </span>
      </div>
      <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      <p className={`mt-1 text-sm font-medium ${SUBLABEL_TONES[sublabelTone]}`}>{sublabel}</p>
    </div>
  );
}
