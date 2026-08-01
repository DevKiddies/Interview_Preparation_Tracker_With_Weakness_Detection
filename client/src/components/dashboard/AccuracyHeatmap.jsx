import React from "react";

// Expanded 10-Tier Vibrant Color Palette (10% increments from 0 to 100)
const getColor = (accuracy) => {
    if (accuracy === undefined || accuracy === null)
        return "bg-slate-50 dark:bg-slate-800/60 text-slate-300 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-700";

    if (accuracy >= 90) // 90-100% (Ultra High - Emerald/Cyan Glow)
        return "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white font-extrabold shadow-md shadow-emerald-500/30 ring-1 ring-inset ring-white/30";
    if (accuracy >= 80) // 80-89% (High - Deep Emerald)
        return "bg-gradient-to-br from-emerald-300 to-emerald-500 text-emerald-950 font-bold shadow-sm shadow-emerald-400/25 ring-1 ring-inset ring-white/20";
    if (accuracy >= 70) // 70-79% (Medium High - Bright Teal)
        return "bg-gradient-to-br from-teal-300 to-emerald-400 text-teal-950 font-bold shadow-sm shadow-teal-400/25 ring-1 ring-inset ring-white/20";
    if (accuracy >= 60) // 60-69% (Good - Lime/Green Accent)
        return "bg-gradient-to-br from-lime-300 to-emerald-400 text-lime-950 font-bold shadow-sm shadow-lime-400/25 ring-1 ring-inset ring-white/20";
    if (accuracy >= 50) // 50-59% (Average - Warm Yellow Gold)
        return "bg-gradient-to-br from-yellow-300 to-amber-400 text-yellow-950 font-bold shadow-sm shadow-yellow-400/25 ring-1 ring-inset ring-white/20";
    if (accuracy >= 40) // 40-49% (Warning - Bright Amber)
        return "bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 font-bold shadow-sm shadow-amber-500/25 ring-1 ring-inset ring-white/20";
    if (accuracy >= 30) // 30-39% (At Risk - Vivid Orange)
        return "bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold shadow-sm shadow-orange-500/30 ring-1 ring-inset ring-white/20";
    if (accuracy >= 20) // 20-29% (Critical - Red Orange)
        return "bg-gradient-to-br from-orange-500 to-rose-500 text-white font-bold shadow-sm shadow-rose-500/30 ring-1 ring-inset ring-white/20";
    if (accuracy >= 10) // 10-19% (Severe - Bright Crimson)
        return "bg-gradient-to-br from-rose-500 to-rose-600 text-white font-extrabold shadow-sm shadow-rose-600/35 ring-1 ring-inset ring-white/20";

    // 0-9% (Critical Failure - Deep Ruby/Magenta Pink)
    return "bg-gradient-to-br from-rose-600 via-pink-600 to-red-700 text-white font-black shadow-md shadow-rose-700/40 ring-1 ring-inset ring-white/30";
};

function Cell({ topic, difficulty, accuracy }) {
    const hasData = accuracy !== undefined && accuracy !== null;

    return (
        <div className="group relative flex-1">
            {/* Responsive Capsule Block */}
            <div
                className={`h-8 w-full rounded-md flex items-center justify-center text-[10px] tracking-tight transition-all duration-200 ease-out cursor-pointer hover:scale-[1.08] hover:z-20 hover:shadow-lg ${getColor(
                    accuracy
                )}`}
            >
                {hasData ? `${accuracy}%` : "—"}
            </div>

            {/* Hover Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden -translate-x-1/2 rounded-lg border border-slate-100 bg-white/95 p-2 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 backdrop-blur-sm group-hover:block dark:border-slate-800 dark:bg-slate-950/95 min-w-32 text-left animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-35 mb-0.5">
                    {topic}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{difficulty} Sector</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {hasData ? `${accuracy}%` : "No data"}
                    </span>
                </div>
                {/* Tooltip Caret */}
                <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950" />
            </div>
        </div>
    );
}

export default function AccuracyHeatmap({ data = [] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 ring-1 ring-black/[0.02] dark:border-slate-800 dark:bg-slate-900">

            {/* Header */}
            <div className="mb-4 space-y-1">
                <h2 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Accuracy Heatmap
                </h2>
                <p className="text-[9px] font-black uppercase tracking-normal text-slate-500 dark:text-slate-400 opacity-80">
                    Accuracy matrix mapped across topics and difficulty sectors.
                </p>
            </div>

            {/* Matrix Grid Container */}
            <div className="space-y-2">
                {/* Column Headers */}
                <div className="flex items-center">
                    <div className="w-28 shrink-0" />
                    <div className="flex flex-1 gap-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <div className="flex-1">Easy</div>
                        <div className="flex-1">Medium</div>
                        <div className="flex-1">Hard</div>
                    </div>
                </div>

                {/* Matrix Rows */}
                <div className="space-y-1.5">
                    {data.map((row, i) => (
                        <div
                            key={row.topic}
                            className={`flex items-center rounded-md -mx-1.5 px-1.5 py-0.5 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                                i % 2 === 1 ? "bg-slate-50/50 dark:bg-slate-800/20" : ""
                            }`}
                        >
                            {/* Row Label */}
                            <div className="w-28 shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-400 truncate pr-3">
                                {row.topic}
                            </div>

                            {/* Cells */}
                            <div className="flex flex-1 gap-1.5">
                                <Cell topic={row.topic} difficulty="Easy" accuracy={row.easy} />
                                <Cell topic={row.topic} difficulty="Medium" accuracy={row.medium} />
                                <Cell topic={row.topic} difficulty="Hard" accuracy={row.hard} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Expanded 10-Step Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-medium text-slate-400">
                <span className="shrink-0 font-semibold text-rose-500">Less Accurate (0%)</span>

                <div className="flex items-center gap-1">
                    <div title="0-9%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-rose-600 to-red-700 shadow-sm" />
                    <div title="10-19%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-rose-500 to-rose-600 shadow-sm" />
                    <div title="20-29%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-orange-500 to-rose-500 shadow-sm" />
                    <div title="30-39%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-orange-400 to-orange-500 shadow-sm" />
                    <div title="40-49%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-amber-400 to-amber-500 shadow-sm" />
                    <div title="50-59%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-yellow-300 to-amber-400 shadow-sm" />
                    <div title="60-69%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-lime-300 to-emerald-400 shadow-sm" />
                    <div title="70-79%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-teal-300 to-emerald-400 shadow-sm" />
                    <div title="80-89%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-emerald-300 to-emerald-500 shadow-sm" />
                    <div title="90-100%" className="h-3 w-4 rounded-sm bg-gradient-to-br from-emerald-400 to-teal-600 shadow-sm" />
                </div>

                <span className="shrink-0 font-semibold text-emerald-500">More Accurate (100%)</span>
            </div>

        </div>
    );
}