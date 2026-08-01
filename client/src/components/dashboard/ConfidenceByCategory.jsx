import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ConfidenceByCategory({ topics = [] }) {
    const navigate = useNavigate();
    const getColor = (confidence) => {
        if (confidence < 40) return "bg-rose-500 dark:bg-rose-600";
        if (confidence < 60) return "bg-amber-500";
        if (confidence < 80) return "bg-yellow-500";
        return "bg-emerald-500 dark:bg-emerald-600";
    };

    const getLabel = (confidence) => {
        if (confidence < 40) return "Needs Attention";
        if (confidence < 60) return "Needs Practice";
        if (confidence < 80) return "Good";
        return "Strong";
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Confidence by Category
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Performance metrics breakdown across core concepts.
                </p>
            </div>

            {/* Bar Graph Container */}
            <div className="relative space-y-3">
                {/* Background Grid Lines to make it look like a real chart axis */}
                <div className="absolute inset-y-0 left-32 right-14 pointer-events-none flex justify-between">
                    <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                    <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                    <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                    <div className="w-px h-full border-l border-dashed border-slate-100 dark:border-slate-800" />
                </div>

                {topics.map((topic) => (
                    <div
                        key={topic.id}
                        onClick={() => navigate(`/confidence/category/${topic.id}`)}
                        className="group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 rounded-lg p-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer relative z-10"
                    >
                        {/* Graph Y-Axis: Topic & Label */}
                        <div className="w-full sm:w-32 shrink-0">
                            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                {topic.name}
                            </h3>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none mt-0.5">
                {getLabel(topic.confidence)}
              </span>
                        </div>

                        {/* Graph X-Axis: Independent Data Bars */}
                        <div className="flex flex-1 items-center gap-3 w-full">
                            {/* Actual Chart Bar Area */}
                            <div className="flex-1 h-3 flex items-center">
                                <div
                                    className={`h-full rounded-sm transition-all duration-700 ${getColor(
                                        topic.confidence
                                    )}`}
                                    style={{
                                        width: `${topic.confidence}%`,
                                    }}
                                />
                            </div>

                            {/* Data Value & Navigation */}
                            <div className="flex items-center gap-1 min-w-12 justify-end shrink-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {topic.confidence}%
                </span>
                                <ChevronRight
                                    size={14}
                                    className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}