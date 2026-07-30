import { Brain, Target, Flame, Trophy } from "lucide-react";

const STATS = [
    {
        title: "Total Goals",
        value: "12",
        icon: Brain,
        bg: "from-blue-600 to-cyan-500 dark:from-blue-700 dark:to-cyan-600",
        iconBg: "bg-white/20 text-white",
        textTitle: "text-blue-100",
        textValue: "text-white",
        // Glow effect handled entirely via shadow-blue and colored ring
        glow: "ring-blue-400 shadow-[0_4px_20px_-2px_rgba(59,130,246,0.5)]",
    },
    {
        title: "Completed",
        value: "9",
        icon: Target,
        bg: "from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500",
        iconBg: "bg-white/20 text-white",
        textTitle: "text-emerald-100",
        textValue: "text-white",
        glow: "ring-emerald-400 shadow-[0_4px_20px_-2px_rgba(16,185,129,0.5)]",
    },
    {
        title: "Active Track",
        value: "1",
        icon: Flame,
        bg: "from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600",
        iconBg: "bg-white/20 text-white",
        textTitle: "text-amber-100",
        textValue: "text-white",
        glow: "ring-amber-400 shadow-[0_4px_20px_-2px_rgba(245,158,11,0.5)]",
    },
    {
        title: "Success Rate",
        value: "78%",
        icon: Trophy,
        bg: "from-purple-600 to-fuchsia-500 dark:from-purple-700 dark:to-fuchsia-600",
        iconBg: "bg-white/20 text-white",
        textTitle: "text-purple-100",
        textValue: "text-white",
        glow: "ring-purple-400 shadow-[0_4px_20px_-2px_rgba(139,92,246,0.5)]",
    },
];

function HistoryOverview() {
    return (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {STATS.map((s) => {
                const Icon = s.icon;
                return (
                    <div
                        key={s.title}
                        className={`relative overflow-hidden rounded-xl bg-linear-to-br ${s.bg} p-3 ring-1 ${s.glow}`}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg backdrop-blur-sm ${s.iconBg}`}>
                                <Icon size={16} strokeWidth={2.5} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className={`truncate text-[10px] font-bold uppercase tracking-wider ${s.textTitle}`}>
                                    {s.title}
                                </p>
                                <p className={`text-[16px] font-black leading-tight ${s.textValue}`}>
                                    {s.value}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default HistoryOverview;