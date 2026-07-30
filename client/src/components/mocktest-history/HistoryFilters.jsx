import { Search } from "lucide-react";

const STATUSES = ["All", "Completed", "Abandoned"];
const TYPES = ["All", "Mock Test", "Topic Test"];
const SORTS = ["Newest", "Oldest", "Highest Accuracy", "Highest Confidence"];

function HistoryFilters({ search, onSearchChange, status, onStatusChange, type, onTypeChange, sort, onSortChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-40">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search test..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 pl-9 pr-3 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      >
        {SORTS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

export default HistoryFilters;
