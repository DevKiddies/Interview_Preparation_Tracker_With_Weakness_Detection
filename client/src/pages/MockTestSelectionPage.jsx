import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, ChevronRight, Code2, Database, Server, Globe } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import PageHeader from "../components/mock-test-selection/PageHeader";
import FilterBar from "../components/mock-test-selection/FilterBar";
import TestGrid from "../components/mock-test-selection/TestGrid";
import RecommendedTests from "../components/mock-test-selection/RecommendedTests";
import EmptyState from "../components/mock-test-selection/EmptyState";
import LoadingSkeleton from "../components/mock-test-selection/LoadingSkeleton";
import API_BASE from "../utils/api.js";
import { getCachedProfile, setCachedProfile } from "../utils/profileCache";

const FULL_TESTS = [
    {
        id: "dsa",
        title: "DSA Fundamentals",
        description: "Arrays, HashMaps, Trees, Graphs, Sorting & Dynamic Programming",
        icon: Code2,
        iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        questions: 20,
        timeMins: 90,
        time: "90 min",
        difficulty: "Mixed",
        difficultyColor: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        accent: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20",
        available: true,
    },
    {
        id: "os",
        title: "Operating Systems",
        description: "Processes, Scheduling, Memory Management & Deadlocks",
        icon: Server,
        iconBg: "bg-teal-50 dark:bg-teal-500/10",
        iconColor: "text-teal-600 dark:text-teal-400",
        questions: 20,
        timeMins: 60,
        time: "60 min",
        difficulty: "Medium",
        difficultyColor: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
        accent: "bg-teal-500 hover:bg-teal-600 shadow-teal-500/20",
        available: false,
    },
    {
        id: "dbms",
        title: "Database Systems",
        description: "SQL, Normalization, Transactions, Indexing & Optimization",
        icon: Database,
        iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        questions: 25,
        timeMins: 75,
        time: "75 min",
        difficulty: "Hard",
        difficultyColor: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
        accent: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
        available: false,
    },
    {
        id: "networks",
        title: "Computer Networks",
        description: "OSI Model, TCP/IP, DNS, HTTP & Routing Protocols",
        icon: Globe,
        iconBg: "bg-purple-50 dark:bg-purple-500/10",
        iconColor: "text-purple-600 dark:text-purple-400",
        questions: 20,
        timeMins: 60,
        time: "60 min",
        difficulty: "Medium",
        difficultyColor: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
        accent: "bg-purple-500 hover:bg-purple-600 shadow-purple-500/20",
        available: false,
    },
];

export default function MockTestSelectionPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [profile, setProfile] = useState(() => getCachedProfile());
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [difficulty, setDifficulty] = useState("All");
    const [company, setCompany] = useState("All");
    const [topic, setTopic] = useState("All");
    const [activeCategory, setActiveCategory] = useState("All");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.username) {
                    setUsername(data.username);
                    localStorage.setItem("username", data.username);
                }
                if (data.avatarUrl) {
                    localStorage.setItem("avatarUrl", data.avatarUrl);
                }
                setProfile(data);
                setCachedProfile(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const daysLeft = useMemo(() => {
        if (!profile?.interviewDate) return null;
        const target = new Date(profile.interviewDate);
        const today = new Date();
        target.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diff >= 0 ? diff : 0;
    }, [profile?.interviewDate]);

    const targetLabel = TARGET_LABELS[profile?.targetCompany] ?? null;
    const experienceLabel = EXPERIENCE_LABELS[profile?.experienceLevel] ?? null;

    const filteredTests = useMemo(() => {
        return FULL_TESTS.filter((test) => {
            const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDifficulty = difficulty === "All" || test.difficulty === difficulty;
            return matchesSearch && matchesDifficulty;
        });
    }, [searchQuery, difficulty]);

    const resetFilters = () => {
        setSearchQuery("");
        setDifficulty("All");
        setCompany("All");
        setTopic("All");
        setActiveCategory("All");
    };

    return (
        <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
            <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
                <Sidebar
                    username={username}
                    targetLabel={targetLabel}
                    experienceLabel={experienceLabel}
                    daysLeft={daysLeft}
                />

                <div className="min-w-0 flex-1 space-y-5 pb-[calc(4rem_+_env(safe-area-inset-bottom))] lg:pb-0">
                    <PageHeader />

                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <>
                            {/* Compact & Stylish Topic Banner */}
                            <div className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 p-5 shadow-lg shadow-indigo-500/20 sm:flex-row sm:items-center sm:justify-between">
                                {/* Ambient glow accents */}
                                <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/15 blur-3xl transition-all duration-500 group-hover:bg-white/25" />
                                <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-violet-400/20 blur-3xl" />

                                <div className="relative flex items-center gap-4 min-w-0">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-inner shadow-white/10">
                                        <SlidersHorizontal size={22} />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-bold text-white tracking-tight">Practice a Specific Topic</h2>
                                            <span className="inline-flex items-center rounded-md bg-indigo-400/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-100 border border-indigo-300/20">
                                                70+ Topics
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[13px] text-indigo-100/85 truncate">
                                            Custom question counts & flexible time limits tailored to you.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/practice/topic-test")}
                                    className="relative flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition-all duration-150 hover:bg-indigo-50 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <span>Configure</span>
                                    <ChevronRight size={15} className="text-indigo-600" />
                                </button>
                            </div>

                            <FilterBar
                                search={searchQuery}
                                onSearchChange={setSearchQuery}
                                difficulty={difficulty}
                                onDifficultyChange={setDifficulty}
                                company={company}
                                onCompanyChange={setCompany}
                                topic={topic}
                                onTopicChange={setTopic}
                            />

                            <RecommendedTests />

                            <div>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                                    Full Assessments
                                </h2>
                                {filteredTests.length > 0 ? (
                                    <TestGrid tests={filteredTests} />
                                ) : (
                                    <EmptyState onResetFilters={resetFilters} />
                                )}
                            </div>

                            <p className="pt-2 text-center text-xs text-slate-400 dark:text-slate-600">
                                All tests are auto-graded with detailed results and category breakdown shown immediately.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const TARGET_LABELS = {
    faang: "FAANG / Big Tech",
    product: "Product Companies",
    service: "Service Companies",
    competitive: "Competitive Exams",
};

const EXPERIENCE_LABELS = {
    fresher: "Student / Fresher",
    mid: "Mid-level",
    senior: "Senior",
};