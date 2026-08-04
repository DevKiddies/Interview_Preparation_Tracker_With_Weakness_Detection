import { useState } from "react";
import { ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TREND_ICON = {
  up: <TrendingUp size={11} className="text-emerald-500" />,
  down: <TrendingDown size={11} className="text-rose-500" />,
  flat: <Minus size={11} className="text-slate-400" />,
};

const TABS = ["Readiness", "Accuracy"];

export default function ReadinessByCategory({ topics = [] }) {
    const navigate = useNavigate();
    const [tab, setTab] = useState("Readiness");
    const isAccuracy = tab === "Accuracy";

    const getColor = (value) => {
        if (value < 40) return "bg-rose-500 dark:bg-rose-600";
        if (value < 60) return "bg-amber-500";
        if (value < 80) return "bg-yellow-500";
        return "bg-emerald-500 dark:bg-emerald-600";
    };

    const getLabel = (value) => {
        if (value < 40) return "Needs Attention";
        if (value < 60) return "Needs Practice";
        if (value < 80) return "Good";
        return "Strong";
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header Container */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        {isAccuracy ? "Accuracy by Category" : "Readiness by Category"}
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-normal text-slate-500 dark:text-slate-400 opacity-80">
                        Performance metrics breakdown across core concepts.
                    </p>
                </div>

                {/* Metric Tab Switch */}
                <div className="flex bg-slate-50 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-100 dark:border-slate-800 self-start sm:self-auto">
                    {TABS.map((item) => (
                        <button
                            key={item}
                            onClick={() => setTab(item)}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
                                tab === item
                                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bar Graph Container */}
            {topics.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                    No attempts yet — take your first test to build this up.
                </div>
            ) : (
                <div className="relative max-h-72 scrollbar-hidden overflow-y-auto space-y-3 pr-1">
                    {/* Background Grid Lines to make it look like a real chart axis */}
                    <div className="absolute inset-y-0 left-32 right-14 pointer-events-none flex justify-between">
                        <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                        <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                        <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                        <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                    </div>

                    {topics.map((topic) => {
                        const raw = isAccuracy ? topic.accuracy : topic.confidence;
                        const value = raw == null ? 0 : raw;
                        return (
                            <div
                                key={topic.id}
                                onClick={() => navigate(`/readiness/category/${topic.id}`)}
                                className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-lg p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer relative z-10"
                            >
                                {/* Graph Y-Axis: Topic & Label */}
                                <div className="w-full sm:w-32 shrink-0">
                                    <div className="flex items-center gap-1">
                                        <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                            {topic.name}
                                        </h3>
                                        {!isAccuracy && (TREND_ICON[topic.trend] ?? null)}
                                    </div>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                                        {getLabel(value)}
                                    </span>
                                </div>

                                {/* Graph X-Axis: Independent Data Bars */}
                                <div className="flex flex-1 items-center gap-3 w-full">
                                    {/* Actual Chart Bar Area */}
                                    <div className="flex-1 h-3 flex items-center">
                                        <div
                                            className={`h-full rounded-sm transition-all duration-700 ${getColor(
                                                value
                                            )}`}
                                            style={{
                                                width: `${value}%`,
                                            }}
                                        />
                                    </div>

                                    {/* Data Value & Navigation */}
                                    <div className="flex items-center gap-1 min-w-12 justify-end shrink-0">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            {value}%
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
