function LoadingSkeleton({ count = 4 }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="mt-5 h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
            ))}
        </div>
    );
}

export default LoadingSkeleton;
