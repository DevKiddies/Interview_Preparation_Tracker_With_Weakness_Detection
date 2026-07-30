const TABS = [
    { key: "overview", label: "Overview" },
    { key: "analytics", label: "Analytics" },
    { key: "review", label: "Review" },
];

export default function ResultTabs({ activeTab, onTabChange }) {
    return (
        <div className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6">
            <div className="flex w-full overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100/50 p-1 dark:border-zinc-800/80 dark:bg-zinc-900/50">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => onTabChange(tab.key)}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                            activeTab === tab.key
                                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/50 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700/50"
                                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}