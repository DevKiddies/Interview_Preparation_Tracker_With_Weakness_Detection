import { PlayCircle, Clock, Lock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TestCard({ test }) {
    const navigate = useNavigate();
    const Icon = test.icon;

    const handleStart = (e) => {
        e.stopPropagation();
        if (!test.available) return;

        // Admin-created tests (from /api/tests/available) carry a topicConfig and
        // ride the same "topic practice" question-fetching path the custom topic
        // builder already uses, instead of the fixed built-in test ids below.
        if (test.topicConfig) {
            navigate("/practice/instructions", {
                state: {
                    nextUrl: "/practice/mock-tests/topic",
                    nextState: test.topicConfig,
                    testTitle: test.title,
                    questions: test.questions,
                    timeMins: test.timeMins,
                    difficulty: test.difficulty,
                    description: test.description,
                },
            });
            return;
        }

        navigate("/practice/instructions", {
            state: {
                nextUrl: `/practice/mock-tests/${test.id}`,
                nextState: null,
                testTitle: test.title,
                questions: test.questions,
                timeMins: test.timeMins,
                difficulty: test.difficulty,
                description: test.description,
            },
        });
    };

    return (
        <div
            onClick={handleStart}
            className={`group relative flex flex-col justify-between rounded-xl border p-4.5 transition-all duration-200 ${
                test.available
                    ? "cursor-pointer border-slate-200/80 bg-white hover:border-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                    : "cursor-not-allowed border-slate-200/50 bg-slate-50/50 opacity-60 dark:border-slate-800/50 dark:bg-slate-900/40"
            }`}
        >
            {/* Top Header Section */}
            <div>
                <div className="flex items-start justify-between gap-3">
                    {/* Icon + Title Header */}
                    <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 dark:border-slate-800 ${test.iconBg}`}>
                            <Icon size={18} className={test.iconColor} />
                        </div>
                        <h3 className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
                            {test.title}
                        </h3>
                    </div>

                    {/* Lock Badge for unavailable tests */}
                    {!test.available && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Lock size={10} />
                            Soon
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500 line-clamp-2 dark:text-slate-400">
                    {test.description}
                </p>

                {/* Metadata Badges */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md border border-slate-200/60 bg-slate-50/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                        {test.questions} Qs
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/60 bg-slate-50/80 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                        <Clock size={11} className="text-slate-400" />
                        {test.time}
                    </span>

                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${test.difficultyColor}`}>
                        {test.difficulty}
                    </span>
                </div>
            </div>

            {/* Compact Action Footer */}
            {test.available && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="inline-flex items-center gap-1.5">
                        <PlayCircle size={14} />
                        Start Assessment
                    </span>
                    <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </div>
            )}
        </div>
    );
}

export default TestCard;