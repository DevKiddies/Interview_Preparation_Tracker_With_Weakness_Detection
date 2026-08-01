import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/dashboard/Sidebar";
import PageHeader from "../components/interview-history/PageHeader";
import HistoryOverview from "../components/interview-history/HistoryOverview";
import HistoryFilters from "../components/interview-history/HistoryFilters";
import InterviewTimeline from "../components/interview-history/InterviewTimeline";
import EmptyState from "../components/interview-history/EmptyState";
import MockHistoryOverview from "../components/mocktest-history/HistoryOverview";
import MockHistoryFilters from "../components/mocktest-history/HistoryFilters";
import MockTestTimeline from "../components/mocktest-history/MockTestTimeline";
import MockEmptyState from "../components/mocktest-history/EmptyState";
import API_BASE from "../utils/api";
import { MOCK_TESTS } from "../data/mockTestData";

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

const MOCK_INTERVIEWS = [
  {
    id: 1,
    targetCompany: "faang",
    experience: "fresher",
    startDate: "2026-01-02",
    interviewDate: "2026-03-21",
    status: "COMPLETED",
    confidence: 81,
    accuracy: 78,
    questionsSolved: 1234,
    duration: 79,
    weakTopics: ["Dynamic Programming", "Graphs", "System Design"],
  },
  {
    id: 2,
    targetCompany: "product",
    experience: "mid",
    startDate: "2026-05-10",
    interviewDate: "2026-07-28",
    status: "ACTIVE",
    confidence: 73,
    accuracy: 69,
    questionsSolved: 412,
    duration: null,
    weakTopics: ["Sliding Window", "Greedy Algorithms"],
  },
  {
    id: 3,
    targetCompany: "service",
    experience: "senior",
    startDate: "2025-09-01",
    interviewDate: "2025-11-15",
    status: "COMPLETED",
    confidence: 88,
    accuracy: 74,
    questionsSolved: 876,
    duration: 75,
    weakTopics: ["System Design", "Microservices"],
  },
  {
    id: 4,
    targetCompany: "faang",
    experience: "fresher",
    startDate: "2025-03-01",
    interviewDate: "2025-05-10",
    status: "ARCHIVED",
    confidence: 54,
    accuracy: 49,
    questionsSolved: 312,
    duration: 70,
    weakTopics: ["Dynamic Programming", "Trees", "Graphs", "OOP"],
  },
];

function InterviewHistoryPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("interview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [targetFilter, setTargetFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [mockSearch, setMockSearch] = useState("");
  const [mockStatus, setMockStatus] = useState("All");
  const [mockType, setMockType] = useState("All");
  const [mockSort, setMockSort] = useState("Newest");

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
          window.dispatchEvent(new CustomEvent("user-profile-updated"));
          setProfile(data);
        })
        .catch(() => {});
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

  const filtered = useMemo(() => {
    let result = [...MOCK_INTERVIEWS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
          i.targetCompany.toLowerCase().includes(q) ||
          i.weakTopics.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((i) => i.status === statusFilter.toUpperCase());
    }

    if (targetFilter !== "All") {
      const map = { "FAANG": "faang", "Product": "product", "Service": "service", "Competitive Exams": "competitive" };
      result = result.filter((i) => i.targetCompany === map[targetFilter]);
    }

    result.sort((a, b) => {
      switch (sort) {
        case "Oldest": return new Date(a.startDate) - new Date(b.startDate);
        case "Most Questions": return (b.questionsSolved || 0) - (a.questionsSolved || 0);
        case "Highest Accuracy": return (b.accuracy || 0) - (a.accuracy || 0);
        default: return new Date(b.startDate) - new Date(a.startDate);
      }
    });

    return result;
  }, [search, statusFilter, targetFilter, sort]);

  const handleViewDetails = (interview) => {
    navigate(`/history/interview/${interview.id}/tests`);
  };

  const handleViewAnalysis = (test) => {
    navigate("/practice/results", { state: { attemptId: test.id } });
  };

  const mockFiltered = useMemo(() => {
    let result = [...MOCK_TESTS];

    if (mockSearch.trim()) {
      const q = mockSearch.toLowerCase();
      result = result.filter((t) =>
          t.title.toLowerCase().includes(q) ||
          t.weakTopics.some((w) => w.toLowerCase().includes(q))
      );
    }

    if (mockStatus !== "All") result = result.filter((t) => t.status === mockStatus.toUpperCase());
    if (mockType !== "All") result = result.filter((t) => t.type === (mockType === "Mock Test" ? "MOCK" : "TOPIC"));

    result.sort((a, b) => {
      switch (mockSort) {
        case "Oldest": return new Date(a.completedAt) - new Date(b.completedAt);
        case "Highest Accuracy": return (b.accuracy || 0) - (a.accuracy || 0);
        case "Highest Confidence": return (b.confidence || 0) - (a.confidence || 0);
        default: return new Date(b.completedAt) - new Date(a.completedAt);
      }
    });

    return result;
  }, [mockSearch, mockStatus, mockType, mockSort]);

  const hasData = MOCK_INTERVIEWS.length > 0;
  const hasMockData = MOCK_TESTS.length > 0;

  return (
      <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar
              username={username}
              targetLabel={targetLabel}
              experienceLabel={experienceLabel}
              daysLeft={daysLeft}
          />

          <div className="min-w-0 flex-1 space-y-6 pb-[calc(4rem_+_env(safe-area-inset-bottom))] lg:pb-0">
            <PageHeader />

            {/* Animated Section Tabs Header */}
            <div className="relative flex w-fit rounded-lg border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
              {/* Interview History Tab Button */}
              <button
                  onClick={() => setTab("interview")}
                  className={`relative z-10 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                      tab === "interview"
                          ? "text-indigo-600 dark:text-white"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                {tab === "interview" && (
                    <motion.div
                        layoutId="active-history-tab"
                        className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-slate-800"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10">Interview History</span>
              </button>

              {/* Mock Test History Tab Button */}
              <button
                  onClick={() => setTab("mock")}
                  className={`relative z-10 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors duration-200 ${
                      tab === "mock"
                          ? "text-indigo-600 dark:text-white"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
              >
                {tab === "mock" && (
                    <motion.div
                        layoutId="active-history-tab"
                        className="absolute inset-0 rounded-md bg-white shadow-sm dark:bg-slate-800"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10">Mock Test History</span>
              </button>
            </div>

            {/* Animated Tab Content Switch */}
            <AnimatePresence mode="wait">
              {tab === "mock" ? (
                  <motion.div
                      key="mock-tab"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-6"
                  >
                    <MockHistoryOverview />
                    <MockHistoryFilters
                        search={mockSearch}
                        onSearchChange={setMockSearch}
                        status={mockStatus}
                        onStatusChange={setMockStatus}
                        type={mockType}
                        onTypeChange={setMockType}
                        sort={mockSort}
                        onSortChange={setMockSort}
                    />
                    {mockFiltered.length > 0 ? (
                        <MockTestTimeline tests={mockFiltered} onViewAnalysis={handleViewAnalysis} />
                    ) : hasMockData ? (
                        <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                          No mock tests match your filters.
                        </p>
                    ) : (
                        <MockEmptyState />
                    )}
                  </motion.div>
              ) : (
                  <motion.div
                      key="interview-tab"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="space-y-6"
                  >
                    {hasData && (
                        <>
                          <HistoryOverview />
                          <HistoryFilters
                              search={search}
                              onSearchChange={setSearch}
                              status={statusFilter}
                              onStatusChange={setStatusFilter}
                              target={targetFilter}
                              onTargetChange={setTargetFilter}
                              sort={sort}
                              onSortChange={setSort}
                          />
                        </>
                    )}

                    {filtered.length > 0 ? (
                        <InterviewTimeline interviews={filtered} onViewDetails={handleViewDetails} />
                    ) : hasData ? (
                        <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                          No interviews match your filters.
                        </p>
                    ) : (
                        <EmptyState />
                    )}
                  </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
  );
}

export default InterviewHistoryPage;