const BASE_STEPS = ["Overview", "Target", "Experience", "Date", "Topics"];

function StepIndicator({ current, withResult = false }) {
    const steps = withResult ? ["Result", ...BASE_STEPS] : BASE_STEPS;

    return (
        <div className="flex items-center">
            {steps.map((label, i) => {
                const num = withResult ? i : i + 1;
                const isDone = current > (withResult ? i : num);
                const isCurrent = current === (withResult ? i : num);
                return (
                    <div key={label} className="flex flex-1 items-center last:flex-initial">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                                    isDone
                                        ? "bg-indigo-600 text-white"
                                        : isCurrent
                                            ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-500/20"
                                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                }`}
                            >
                                {isDone ? "✓" : num}
                            </div>
                            <span
                                className={`text-[11px] font-semibold whitespace-nowrap ${
                                    isCurrent
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : isDone
                                            ? "text-slate-600 dark:text-slate-300"
                                            : "text-slate-400 dark:text-slate-500"
                                }`}
                            >
                {label}
              </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={`mx-2 h-0.5 flex-1 rounded-full transition-all ${
                                    isDone ? "bg-indigo-600" : "bg-slate-100 dark:bg-slate-800"
                                }`}
                                style={{ marginBottom: "18px" }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default StepIndicator;
