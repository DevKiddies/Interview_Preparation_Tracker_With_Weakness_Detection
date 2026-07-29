import { useState } from "react";
import { Search } from "lucide-react";

const TOPIC_CATEGORIES = [
    {
        label: "LANGUAGES",
        unselected: "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400",
        selected: "bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900",
        topics: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift"],
    },
    {
        label: "DATA STRUCTURES & ALGORITHMS",
        unselected: "bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-300 hover:bg-violet-500/20 hover:border-violet-400",
        selected: "bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-200 dark:shadow-violet-900",
        topics: [
            "Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Heaps", "Tries",
            "Hashing", "Sorting & Searching", "Recursion", "Dynamic Programming",
            "Greedy Algorithms", "Backtracking", "Bit Manipulation",
            "Sliding Window", "Two Pointers", "Binary Search", "Divide & Conquer",
        ],
    },
    {
        label: "OOP & DESIGN",
        unselected: "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-300 hover:bg-teal-500/20 hover:border-teal-400",
        selected: "bg-teal-600 border-teal-500 text-white shadow-sm shadow-teal-200 dark:shadow-teal-900",
        topics: ["OOP Concepts", "OOP in Java", "Design Patterns", "SOLID Principles"],
    },
    {
        label: "SYSTEM DESIGN",
        unselected: "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400",
        selected: "bg-cyan-600 border-cyan-500 text-white shadow-sm shadow-cyan-200 dark:shadow-cyan-900",
        topics: ["System Design", "Low Level Design", "Microservices", "REST APIs", "Message Queues", "Caching", "Load Balancing", "Rate Limiting"],
    },
    {
        label: "DATABASES",
        unselected: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400",
        selected: "bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900",
        topics: ["SQL", "Database Design", "Indexing & Query Optimization", "Transactions & ACID", "NoSQL", "MongoDB", "Redis"],
    },
    {
        label: "WEB & FRAMEWORKS",
        unselected: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20 hover:border-amber-400",
        selected: "bg-amber-500 border-amber-400 text-white shadow-sm shadow-amber-200 dark:shadow-amber-900",
        topics: ["Web Programming", "React", "Node.js", "SpringBoot", "Django", "FastAPI"],
    },
    {
        label: "CS FUNDAMENTALS",
        unselected: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 hover:border-rose-400",
        selected: "bg-rose-600 border-rose-500 text-white shadow-sm shadow-rose-200 dark:shadow-rose-900",
        topics: ["Operating Systems", "Process & Threads", "Memory Management", "Computer Networks", "TCP/IP", "HTTP & HTTPS", "DBMS", "Compiler Design", "Computer Architecture"],
    },
    {
        label: "TOOLS & PRACTICES",
        unselected: "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 hover:border-slate-400",
        selected: "bg-slate-500 border-slate-400 text-white shadow-sm shadow-slate-200 dark:shadow-slate-900",
        topics: ["Git & Version Control", "Docker", "Kubernetes", "CI/CD", "Time & Space Complexity", "Problem Solving"],
    },
];

function TopicsSelection({ value, onChange }) {
    const [search, setSearch] = useState("");

    const toggleTopic = (topic) => {
        onChange(
            value.includes(topic)
                ? value.filter((t) => t !== topic)
                : [...value, topic]
        );
    };

    const q = search.toLowerCase();
    const visibleCategories = TOPIC_CATEGORIES.map((cat) => ({
        ...cat,
        topics: q ? cat.topics.filter((t) => t.toLowerCase().includes(q)) : cat.topics,
    })).filter((cat) => cat.topics.length > 0);

    return (
        <div>
            <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Focus Topics
                </h2>
                <div className="relative shrink-0">
                    <Search
                        size={13}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    />
                    <input
                        type="text"
                        placeholder="Search topics…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-32 rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-2.5 text-xs text-slate-700 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 sm:w-40"
                    />
                </div>
            </div>

            {value.length > 0 && (
                <p className="mb-3 text-xs font-medium text-slate-400 dark:text-slate-500">
                    {value.length} selected
                </p>
            )}

            {visibleCategories.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500">No topics match your search.</p>
            )}

            <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
                {visibleCategories.map((cat) => (
                    <div key={cat.label}>
                        <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500">
                            {cat.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {cat.topics.map((topic) => {
                                const isSelected = value.includes(topic);
                                return (
                                    <button
                                        key={topic}
                                        type="button"
                                        onClick={() => toggleTopic(topic)}
                                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                                            isSelected ? cat.selected : cat.unselected
                                        }`}
                                    >
                                        {topic}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopicsSelection;