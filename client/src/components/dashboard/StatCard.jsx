import {
    Brain,
    Target,
    BookOpen,
    Flame,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
} from "lucide-react";

const ICONS = {
    brain: Brain,
    target: Target,
    book: BookOpen,
    flame: Flame,
};

const COLORS = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
};

export default function StatCard({
                                     title,
                                     value,
                                     description,
                                     icon = "brain",
                                     color = "blue",
                                     change,
                                     trend = "neutral",
                                 }) {
    const Icon = ICONS[icon] || Brain;

    const TrendIcon =
        trend === "up"
            ? ArrowUpRight
            : trend === "down"
                ? ArrowDownRight
                : Minus;

    const trendColor =
        trend === "up"
            ? "text-emerald-600 dark:text-emerald-400"
            : trend === "down"
                ? "text-red-600 dark:text-red-400"
                : "text-slate-400";

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">

            {/* Header */}
            <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </p>

                <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${COLORS[color]}`}
                >
                    <Icon size={14} />
                </div>
            </div>

            {/* Main Value */}
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {value}
            </h2>

            {/* Footer */}
            <div className="mt-1 flex items-center gap-1">
                {change && (
                    <>
                        <TrendIcon size={12} className={trendColor} />
                        <span className={`text-xs font-semibold ${trendColor}`}>
              {change}
            </span>
                    </>
                )}

                {description && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>
                )}
            </div>
        </div>
    );
}