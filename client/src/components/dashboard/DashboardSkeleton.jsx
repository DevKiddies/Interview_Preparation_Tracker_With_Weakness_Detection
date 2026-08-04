// DashboardSkeleton.jsx — full-page placeholder shown while the dashboard is
// still being validated/loaded, so the layout (sidebar + content) is visible
// immediately instead of a blank main area. Mirrors DashboardPage's structure
// and uses the same card-based skeleton style as the Mock Test Selection page.

// Stat card shaped like StatCard (icon + label + value + badge).
function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-14 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

// Chart card shaped like the 2-column chart widgets.
function ChartCardSkeleton({ tall = false }) {
  return (
    <div className={`animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${tall ? "h-80" : "h-64"}`}>
      <div className="mb-4 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className={`h-full rounded-xl bg-slate-100 dark:bg-slate-800/60 ${tall ? "h-[calc(100%-2rem)]" : ""}`} />
    </div>
  );
}

export function DashboardContentSkeleton() {
  return (
    <div className="min-w-0 flex-1 space-y-6">
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-10 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCardSkeleton tall />
        <ChartCardSkeleton tall />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden shrink-0 lg:block">
          <div className="sticky top-23 w-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 border-b border-slate-100 p-2 dark:border-slate-800/80">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="mt-3 space-y-2 px-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
              ))}
            </div>
            <div className="mt-4 border-t border-slate-100 p-2 dark:border-slate-800/80">
              <div className="h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </aside>
        <DashboardContentSkeleton />
      </div>
    </div>
  );
}
