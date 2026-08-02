import { Brain, Target, Flame, Trophy } from "lucide-react";

const STATS = [
  {
    title: "Total Tracks",
    key: "total",
    suffix: "",
    icon: Brain,
    bg: "from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600",
    iconBg: "bg-white/20 text-white",
    textTitle: "text-blue-100",
    textValue: "text-white",
    glow: "ring-1 ring-blue-400 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.5)]"
  },
  {
    title: "Completed",
    key: "completed",
    suffix: "",
    icon: Target,
    bg: "from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500",
    iconBg: "bg-white/20 text-white",
    textTitle: "text-emerald-100",
    textValue: "text-white",
    glow: "ring-1 ring-emerald-400 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.5)]"
  },
  {
    title: "Active Tracks",
    key: "active",
    suffix: "",
    icon: Flame,
    bg: "from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600",
    iconBg: "bg-white/20 text-white",
    textTitle: "text-amber-100",
    textValue: "text-white",
    glow: "ring-1 ring-amber-400 shadow-[0_4px_20px_-2px_rgba(245,158,11,0.5)]"
  },
  {
    title: "Success Rate",
    key: "successRate",
    suffix: "%",
    icon: Trophy,
    bg: "from-purple-600 to-fuchsia-500 dark:from-purple-700 dark:to-fuchsia-600",
    iconBg: "bg-white/20 text-white",
    textTitle: "text-purple-100",
    textValue: "text-white",
    glow: "ring-1 ring-purple-400 shadow-[0_4px_20px_-2px_rgba(139,92,246,0.5)]"
  },
];

function HistoryOverview({ total = 0, completed = 0, active = 0, successRate = 0 }) {
  const values = { total, completed, active, successRate };

  return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
              <div
                  key={s.title}
                  className={`flex items-center gap-3 rounded-xl bg-linear-to-br ${s.bg} p-3 ${s.glow}`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg backdrop-blur-sm ${s.iconBg}`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[10px] font-bold uppercase tracking-wider ${s.textTitle}`}>
                    {s.title}
                  </p>
                  <p className={`text-base font-extrabold leading-tight ${s.textValue}`}>
                    {values[s.key]}{s.suffix}
                  </p>
                </div>
              </div>
          );
        })}
      </div>
  );
}

export default HistoryOverview;
