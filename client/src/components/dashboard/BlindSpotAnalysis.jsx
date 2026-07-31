import {
    ResponsiveContainer,
    ComposedChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Bar,
    Cell,
    Scatter,
} from "recharts";

// rose-300 → rose-600, interpolated by how severe the blind spot is relative to the worst one
const COLOR_LOW = { r: 253, g: 164, b: 175 };
const COLOR_HIGH = { r: 225, g: 29, b: 72 };

function intensityColor(value, max) {
    const t = max > 0 ? Math.min(value / max, 1) : 0;
    const r = Math.round(COLOR_LOW.r + (COLOR_HIGH.r - COLOR_LOW.r) * t);
    const g = Math.round(COLOR_LOW.g + (COLOR_HIGH.g - COLOR_LOW.g) * t);
    const b = Math.round(COLOR_LOW.b + (COLOR_HIGH.b - COLOR_LOW.b) * t);
    return `rgb(${r}, ${g}, ${b})`;
}

function CustomTooltip({ active, payload, maxCount }) {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const color = intensityColor(data.count, maxCount);

    return (
        <div className="rounded-xl border border-slate-100 bg-white/95 p-3 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95 min-w-40">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-50 mb-1.5">
                {data.topic}
            </p>
            <div className="flex items-center justify-between gap-4 text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    Overconfidence events
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{data.count}</span>
            </div>
        </div>
    );
}

function ValueDot({ cx, cy, r, fill, count }) {
    return (
        <g>
            <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={fill} strokeWidth={2.5} />
            <text
                x={cx + r + 6}
                y={cy}
                dominantBaseline="central"
                className="fill-slate-500 dark:fill-slate-400 text-[10px] font-bold"
            >
                {count}
            </text>
        </g>
    );
}

export default function BlindSpotAnalysis({ data = [] }) {
    const maxCount = data.reduce((max, d) => Math.max(max, d.count), 0);

    return (
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full">
            {/* Header */}
            <div className="space-y-1">
                <h2 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    Blind Spot Analysis
                </h2>
                <p className="text-[9px] font-black uppercase tracking-normal text-slate-500 dark:text-slate-400 opacity-80">
                    Topics where your confidence most often exceeded your performance.
                </p>
            </div>

            {/* Chart Area */}
            {data.length === 0 ? (
                <div className="flex flex-1 items-center justify-center py-10 text-xs text-slate-400 dark:text-slate-500">
                    No blind spots detected yet — keep practicing to build this up.
                </div>
            ) : (
                <div className="mt-6 flex-1 h-full min-h-65 w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <ComposedChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 10, right: 32, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid
                                horizontal={false}
                                strokeDasharray="4 4"
                                stroke="#f1f5f9"
                                className="dark:stroke-slate-800/60"
                            />

                            <XAxis
                                type="number"
                                allowDecimals={false}
                                domain={[0, 'dataMax']}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                                dy={8}
                            />

                            <YAxis
                                type="category"
                                dataKey="topic"
                                axisLine={false}
                                tickLine={false}
                                width={85} // Set specific width allocated for left labels
                                interval={0}
                                tick={(props) => {
                                    const label = String(props.payload.value ?? "");
                                    const truncated = label.length > 13 ? `${label.slice(0, 12)}…` : label;
                                    return (
                                        <text
                                            x={0} // Hardcodes coordinates to absolute container edge
                                            y={props.y}
                                            dominantBaseline="central"
                                            textAnchor="start"
                                            className="fill-slate-600 dark:fill-slate-400 text-[11px] font-semibold"
                                        >
                                            {label.length > 13 && <title>{label}</title>}
                                            {truncated}
                                        </text>
                                    );
                                }}
                            />

                            <Tooltip
                                content={<CustomTooltip maxCount={maxCount} />}
                                cursor={{ fill: "rgba(148, 163, 184, 0.04)" }}
                            />

                            <Bar
                                dataKey="count"
                                radius={[3, 3, 3, 3]}
                                barSize={6}
                                background={{ fill: "#f8fafc", radius: 3 }}
                                isAnimationActive={false}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.topic} fill={intensityColor(entry.count, maxCount)} />
                                ))}
                            </Bar>

                            <Scatter
                                dataKey="count"
                                isAnimationActive={false}
                                shape={(props) => (
                                    <ValueDot
                                        {...props}
                                        r={4}
                                        fill={intensityColor(props.payload.count, maxCount)}
                                        count={props.payload.count}
                                    />
                                )}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Legend alignment spacer */}
            <div className="h-5 mt-4" />
        </div>
    );
}