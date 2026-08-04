import React from "react";
import { Search } from "lucide-react";

const STATUSES = ["All", "Completed", "Abandoned", "Aborted"];
const TYPES = ["All", "Mock Test", "Topic Test"];
const SORTS = ["Newest", "Oldest", "Highest Accuracy", "Highest Confidence"];

function HistoryFilters({
                            search,
                            onSearchChange,
                            status,
                            onStatusChange,
                            type,
                            onTypeChange,
                            sort,
                            onSortChange,
                        }) {
    return (
        <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
            {/* Search Input - Expands to fill the middle space */}
            <div className="relative w-full sm:flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={16} className="text-slate-400" />
                </div>
                <input
                    type="search"
                    placeholder="Search test..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200/80 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700/60 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
                <FilterSelect
                    label="Status"
                    value={status}
                    options={STATUSES}
                    onChange={onStatusChange}
                    className="w-28"
                />

                <FilterSelect
                    label="Type"
                    value={type}
                    options={TYPES}
                    onChange={onTypeChange}
                    className="w-40"
                />

                <FilterSelect
                    label="Sort By"
                    value={sort}
                    options={SORTS}
                    onChange={onSortChange}
                    isSortSelect={true}
                    className="w-40"
                />
            </div>
        </div>
    );
}

const PLURALS = { Status: "Statuses" };

function allLabel(label) {
    return `All ${PLURALS[label] ?? `${label}s`}`;
}

function FilterSelect({ label, value, options, onChange, isSortSelect = false, className = "" }) {
    // Check active status based on whether it's a sort field or filter field
    const isSelected = isSortSelect ? value !== "Newest" : value !== "All";

    return (
        <div className="relative flex items-center shrink-0">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`h-9 appearance-none rounded-lg border px-3 pr-8 text-xs font-medium cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${className} ${
                    isSelected
                        ? "border-indigo-500/40 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : "border-slate-200/80 bg-slate-50/50 text-slate-600 hover:bg-slate-100/80 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300"
                }`}
            >
                <option value="" disabled hidden>
                    {label}
                </option>
                {options.map((opt) => (
                    <option
                        key={opt}
                        value={opt}
                        className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
                    >
                        {opt === "All" ? allLabel(label) : opt}
                    </option>
                ))}
            </select>

            {/* Custom Chevron Icon */}
            <svg
                className={`pointer-events-none absolute right-2.5 h-3.5 w-3.5 ${
                    isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
        </div>
    );
}

export default HistoryFilters;