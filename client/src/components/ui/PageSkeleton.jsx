// PageSkeleton.jsx — generic full-page placeholder used as the Suspense fallback
// and while ProtectedRoute validates the token, so the layout never flashes a
// blank main area. Route-specific skeletons (e.g. DashboardSkeleton) replace
// this when a page needs to look like its final layout right away.

export default function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800" />
      <div className="h-28 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
        <div className="h-80 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-800" />
      </div>
    </div>
  );
}
