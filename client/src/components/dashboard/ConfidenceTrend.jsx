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

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;

    const confidence = payload[0].value;
    const accuracy = payload[1].value;
    const gap = confidence - accuracy;

    let status = "Well Calibrated";
    let statusColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";

    if (gap > 5) {
        status = "Overconfident";
        statusColor = "text-rose-500 bg-rose-50 dark:bg-rose-500/10";
    } else if (gap < -5) {
        status = "Underconfident";
        statusColor = "text-amber-500 bg-amber-50 dark:bg-amber-500/10";
    }

    return (
        <div className="rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 min-w-44">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{label}</p>
            <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> Confidence
          </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{confidence}%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Accuracy
          </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{accuracy}%</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">Calibration</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusColor}`}>{status}</span>
                </div>
            </div>
        </div>
    );
}

export default function ConfidenceTrend({ data }) {
    const [range, setRange] = useState("7D");

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Header Container */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Confidence & Accuracy Trend
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data[range]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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