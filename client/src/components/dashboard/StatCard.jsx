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

const THEME_STYLES = {
    blue: {
        bg: "from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600",
        glow: "ring-1 ring-blue-400 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.4)]",
        hoverGlow: "hover:shadow-[0_0_22px_rgba(59,130,246,0.65)] hover:ring-blue-300",
        trendUp: "text-emerald-100",
        trendDown: "text-red-200",
        trendNeutral: "text-white/70",
    },
    green: {
        bg: "from-emerald-600 to-teal-500 dark:from-emerald-700 dark:to-teal-600",
        glow: "ring-1 ring-emerald-400 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.4)]",
        hoverGlow: "hover:shadow-[0_0_22px_rgba(16,185,129,0.65)] hover:ring-emerald-300",
        trendUp: "text-emerald-100",
        trendDown: "text-red-200",
        trendNeutral: "text-white/70",
    },
    purple: {
        bg: "from-violet-600 to-purple-500 dark:from-violet-700 dark:to-purple-600",
        glow: "ring-1 ring-violet-400 shadow-[0_4px_20px_-2px_rgba(139,92,246,0.4)]",
        hoverGlow: "hover:shadow-[0_0_22px_rgba(139,92,246,0.65)] hover:ring-violet-300",
        trendUp: "text-emerald-100",
        trendDown: "text-red-200",
        trendNeutral: "text-white/70",
    },
    orange: {
        bg: "from-orange-600 to-amber-500 dark:from-orange-700 dark:to-amber-600",
        glow: "ring-1 ring-orange-400 shadow-[0_4px_20px_-2px_rgba(249,115,22,0.4)]",
        hoverGlow: "hover:shadow-[0_0_22px_rgba(249,115,22,0.65)] hover:ring-orange-300",
        trendUp: "text-emerald-100",
        trendDown: "text-red-200",
        trendNeutral: "text-white/70",
    },
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

    const theme = THEME_STYLES[color] || THEME_STYLES.blue;

    const TrendIcon =
        trend === "up"
            ? ArrowUpRight
            : trend === "down"
                ? ArrowDownRight
                : Minus;

    const trendColor =
        trend === "up"
            ? theme.trendUp
            : trend === "down"
                ? theme.trendDown
                : theme.trendNeutral;

    return (
        <div
            className={`cursor-default rounded-xl bg-gradient-to-br ${theme.bg} p-3 shadow-sm transition-all duration-700 ease-in-out ${theme.glow} ${theme.hoverGlow}`}
        >
            {/* Header */}
            <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-tight text-white opacity-80">
                    {title}
                </p>

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 text-white ring-1 ring-white/25 backdrop-blur-xs">
                    <Icon size={14} strokeWidth={2.5} />
                </div>
            </div>

            {/* Main Value */}
            <h2 className="text-xl font-black tracking-tight text-white">
                {value}
            </h2>

            {/* Footer */}
        </div>
    );
}
