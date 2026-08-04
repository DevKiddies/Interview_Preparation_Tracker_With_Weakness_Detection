import { useState } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

function CalibrationBadge({ gap }) {
    if (gap == null) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">No Data</span>;
    }

    const abs = Math.abs(gap);
    if (abs <= 5) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">Well Calibrated</span>;
    }
    if (gap > 5) {
        if (abs <= 12) {
            return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Slightly Overconfident</span>;
        }
        if (abs <= 20) {
            return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">Overconfident</span>;
        }
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">Severely Overconfident</span>;
    }
    if (abs <= 12) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">Slightly Underconfident</span>;
    }
    if (abs <= 20) {
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">Underconfident</span>;
    }
    return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">Severely Underconfident</span>;
}

// Horizontal bar for a single metric, with the value pinned to its right end.
function MetricBar({ label, value, color, dotClass, trackClass }) {
    const clamped = value == null ? 0 : Math.max(0, Math.min(100, value));
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${dotClass}`} /> {label}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {value != null ? `${value}%` : "—"}
                </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${trackClass}`} style={{ width: `${clamped}%` }} />
            </div>
        </div>
    );
}

// A small center-zero gauge: gap > 0 means overconfident (confidence above accuracy),
// gap < 0 means underconfident. The dot slides toward whichever side confidence leans.
function CalibrationGauge({ gap }) {
    if (gap == null) return null;

    const clamped = Math.max(-25, Math.min(25, gap));
    const position = ((clamped + 25) / 50) * 100;

    const abs = Math.abs(gap);
    let dotColor = "bg-emerald-500";
    if (abs > 5) dotColor = "bg-amber-500";
    if (abs > 12) dotColor = "bg-orange-500";
    if (abs > 20) dotColor = "bg-rose-500";

    return (
        <div className="space-y-1">
            <div className="relative h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400">
                <span
                    className={`absolute -top-[3px] h-3 w-3 rounded-full border-2 border-white shadow dark:border-slate-950 ${dotColor} transition-all duration-200`}
                    style={{ left: `calc(${position}% - 6px)` }}
                />
            </div>
            <div className="flex justify-between text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                <span>Under</span>
                <span className="text-emerald-500">Balanced</span>
                <span>Over</span>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    const confidence = payload.find((p) => p?.dataKey === "confidence")?.value;
    const accuracy = payload.find((p) => p?.dataKey === "accuracy")?.value;

    const gap = confidence != null && accuracy != null ? confidence - accuracy : null;
    const gapText = gap == null ? "—" : `${gap > 0 ? "+" : ""}${Math.round(gap)} pts`;

    let insight = "Complete attempts to see how your confidence aligns with accuracy.";
    if (gap != null) {
        const abs = Math.abs(gap);
        if (abs <= 5) insight = "Confidence matches accuracy — your self-assessment is on point.";
        else if (gap > 0) insight = `You feel ${abs} pts more confident than you perform. Review flagged questions and note where your confidence overshot.`;
        else insight = `You perform ${abs} pts better than you feel. Trust your preparation and answer more decisively.`;
    }

    return (
        <div className="rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 w-60">
            <div className="mb-2.5 flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Gap <span className={gap != null && Math.abs(gap) > 5 ? (gap > 0 ? "text-amber-500" : "text-amber-500") : "text-emerald-500"}>{gapText}</span>
                </span>
            </div>

            <div className="space-y-2 text-xs">
                <MetricBar
                    label="Confidence"
                    value={confidence}
                    dotClass="bg-indigo-500"
                    trackClass="bg-indigo-500"
                />
                <MetricBar
                    label="Accuracy"
                    value={accuracy}
                    dotClass="bg-emerald-500"
                    trackClass="bg-emerald-500"
                />

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">Calibration</span>
                    <CalibrationBadge gap={gap} />
                </div>

                <CalibrationGauge gap={gap} />

                <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">{insight}</p>
            </div>
        </div>
    );
}

export default function ConfidenceTrend({ data }) {
    const [range, setRange] = useState("7D");
    const series = data?.[range] ?? [];

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Header Container */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        Confidence & Accuracy Trend
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-normal text-slate-500 dark:text-slate-400 opacity-80">
                        Performance comparison across your solved matrix timeline.
                    </p>
                </div>

                {/* Tab Selection Switch */}
                <div className="flex bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-100 dark:border-slate-800 self-start sm:self-auto">
                    {["7D", "30D", "90D"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setRange(item)}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
                                range === item
                                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="h-56 w-full -ml-6">
                {series.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                        No attempts in this period yet.
                    </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%" debounce={100}>
                    <AreaChart data={series} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#f1f5f9" className="dark:stroke-slate-800/60" />

                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            dy={8}
                        />

                        <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                            dx={-4}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }} />

                        {/* Confidence Area Fill */}
                        <Area
                            type="monotone"
                            dataKey="confidence"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorConfidence)"
                            dot={{ r: 3, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#6366f1' }}
                        />

                        {/* Accuracy Area Fill */}
                        <Area
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAccuracy)"
                            dot={{ r: 3, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 5, strokeWidth: 0, fill: '#10b981' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                )}
            </div>

            {/* Clean Bottom Legend Indicator */}
            <div className="mt-2 flex items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span>Confidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Accuracy</span>
                </div>
            </div>

        </div>
    );
}