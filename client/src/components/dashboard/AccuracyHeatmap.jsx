const getColor = (accuracy) => {
    if (accuracy === undefined || accuracy === null) return "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800";
    if (accuracy >= 90) return "bg-emerald-500 text-emerald-95 font-bold";
    if (accuracy >= 70) return "bg-emerald-400/80 text-emerald-950 font-bold";
    if (accuracy >= 50) return "bg-amber-400 text-amber-950 font-bold";
    return "bg-rose-500 text-rose-95 font-bold";
};

function Cell({ topic, difficulty, accuracy }) {
    const hasData = accuracy !== undefined && accuracy !== null;

    return (
        <div className="group relative flex-1">
            {/* Full-width responsive box capsule */}
            <div
                className={`h-8 w-full rounded flex items-center justify-center text-[10px] transition-all duration-150 cursor-pointer ${getColor(
                    accuracy
                )}`}
            >
                {hasData ? `${accuracy}%` : "—"}
            </div>

            {/* Modern Tooltip */}
            <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 rounded-lg border border-slate-100 bg-white/95 p-2 shadow-xl backdrop-blur-sm group-hover:block dark:border-slate-800 dark:bg-slate-950/95 min-w-32 text-left">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] mb-0.5">
                    {topic}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{difficulty} Sector</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
            {hasData ? `${accuracy}%` : "No data"}
          </span>
                </div>
            </div>
        </div>
    );
}

export default function AccuracyHeatmap({ data = [] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Header */}
            <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Accuracy Heatmap
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Accuracy matrix mapped across topics and difficulty sectors.
                </p>
            </div>

            {/* Dense Grid Interface */}
            <div className="space-y-2">
                {/* Column Labels spread cleanly matching block alignments */}
                <div className="flex items-center">
                    <div className="w-28 shrink-0" /> {/* Label spacer match */}
                    <div className="flex flex-1 gap-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        <div className="flex-1">Easy</div>
                        <div className="flex-1">Medium</div>
                        <div className="flex-1">Hard</div>
                    </div>
                </div>

                {/* Matrix Rows */}
                <div className="space-y-1.5">
                    {data.map((row) => (
                        <div key={row.topic} className="flex items-center">
                            {/* Row Label - Consistent fixed layout space */}
                            <div className="w-28 shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-400 truncate pr-3">
                                {row.topic}
                            </div>

                            {/* Balanced Block Grid Group */}
                            <div className="flex flex-1 gap-1.5">
                                <Cell topic={row.topic} difficulty="Easy" accuracy={row.easy} />
                                <Cell topic={row.topic} difficulty="Medium" accuracy={row.medium} />
                                <Cell topic={row.topic} difficulty="Hard" accuracy={row.hard} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mini Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-1.5 text-[10px] font-medium text-slate-400">
                <span>Less Accurate</span>
                <div className="h-2.5 w-4 rounded bg-rose-500" />
                <div className="h-2.5 w-4 rounded bg-amber-400" />
                <div className="h-2.5 w-4 rounded bg-emerald-400/80" />
                <div className="h-2.5 w-4 rounded bg-emerald-500" />
                <span>More Accurate</span>
            </div>

        </div>
    );
}