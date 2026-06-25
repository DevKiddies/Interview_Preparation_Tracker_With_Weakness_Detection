// Placeholder dashboard sidebar.
// Intentionally left empty for now — it only reserves layout space on the left.
// The full sidebar (profile, Interview Prep progress, menu, rank, logout) will be
// implemented later. Hidden on small screens.
export default function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 h-[calc(100vh-7rem)] rounded-2xl border border-dashed border-slate-200 bg-white/50 dark:border-slate-800 dark:bg-slate-900/40" />
    </aside>
  );
}
