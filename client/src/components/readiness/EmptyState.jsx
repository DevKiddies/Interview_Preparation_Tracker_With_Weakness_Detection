export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        No readiness data available.
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Complete a few tests to build up your readiness score.
      </p>
    </div>
  );
}
