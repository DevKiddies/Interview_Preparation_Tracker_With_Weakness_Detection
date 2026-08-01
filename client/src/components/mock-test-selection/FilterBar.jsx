import React from "react";

function FilterBar({
                       search = "",
                       onSearchChange,
                       difficulty = "All",
                       onDifficultyChange,
                       company = "All",
                       onCompanyChange,
                       topic = "All",
                       onTopicChange,
                   }) {
    const difficulties = ["All", "Easy", "Medium", "Hard", "Mixed"];
    const companies = ["All", "FAANG", "Product", "Service", "Competitive"];
    const topics = ["All", "DSA", "System Design", "DBMS", "OS", "Networks"];

    return (
        <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
            {/* Search Input - Expands to fill the space cleanly */}
            <div className="relative w-full sm:flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <input
                    type="search"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search tests..."
                    className="h-9 w-full rounded-lg border border-slate-200/80 bg-slate-50/50 dark:bg-slate-800/50 dark:border-slate-700/60 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                />
            </div>

            {/* Filter Dropdowns - Fixed width next to each other */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
                <FilterSelect
                    label="Difficulty"
                    value={difficulty}
                    options={difficulties}
                    onChange={onDifficultyChange}
                />

                <FilterSelect
                    label="Company"
                    value={company}
                    options={companies}
                    onChange={onCompanyChange}
                />

                <FilterSelect
                    label="Topic"
                    value={topic}
                    options={topics}
                    onChange={onTopicChange}
                />
            </div>
        </div>
    );
}

const PLURALS = { Difficulty: "Difficulties", Company: "Companies" };

function allLabel(label) {
    return `All ${PLURALS[label] ?? `${label}s`}`;
}

function FilterSelect({ label, value, options, onChange }) {
    const isSelected = value !== "All";

    return (
        <div className="relative flex items-center shrink-0">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`h-9 appearance-none rounded-lg border px-3 pr-8 text-xs font-medium cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                    isSelected
                        ? "border-indigo-500/40 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                        : "border-slate-200/80 bg-slate-50/50 text-slate-600 hover:bg-slate-100/80 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300"
                }`}
            >
                <option value="All" disabled hidden>
                    {label}
                </option>
                {options.map((opt) => (
                    <option key={opt} value={opt} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
                        {opt === "All" ? allLabel(label) : opt}
                    </option>
                ))}
            </select>

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

export default FilterBar;