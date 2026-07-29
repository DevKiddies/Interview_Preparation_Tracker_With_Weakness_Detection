function RecommendedTests({ tests = [] }) {
    if (tests.length === 0) return null;

    return (
        <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Recommended For You
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
                {tests.map((test, i) => (
                    <div key={i} className="min-w-[220px] rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{test.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{test.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecommendedTests;
