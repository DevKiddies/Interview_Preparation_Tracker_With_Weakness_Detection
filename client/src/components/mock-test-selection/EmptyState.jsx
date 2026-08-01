import { SearchX } from "lucide-react";

function EmptyState({ onResetFilters }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 mb-4">
                <SearchX size={24} className="text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No tests found.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
                Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
                onClick={onResetFilters}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.97] shadow-sm shadow-indigo-200 dark:shadow-indigo-900 transition-all"
            >
                Reset Filters
            </button>
        </div>
    );
}

export default EmptyState;
