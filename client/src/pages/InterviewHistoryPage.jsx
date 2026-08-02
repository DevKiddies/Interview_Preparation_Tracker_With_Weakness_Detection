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
import { getCachedProfile, setCachedProfile } from "../utils/profileCache";

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

function InterviewHistoryPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [tab, setTab] = useState("interview");
  const [interviews, setInterviews] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
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
          setCachedProfile(data);
        })
        .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      fetch(`${API_BASE}/api/interviews`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch(`${API_BASE}/api/tests/history`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
        .then(([interviewData, testData]) => {
          if (Array.isArray(interviewData)) setInterviews(interviewData);
          if (Array.isArray(testData)) setTests(testData);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
  }, []);

  const targetLabel = TARGET_LABELS[profile?.targetCompany] ?? null;
  const experienceLabel = EXPERIENCE_LABELS[profile?.experienceLevel] ?? null;

  const filtered = useMemo(() => {
    let result = [...interviews];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
          i.targetCompany?.toLowerCase().includes(q) ||
          (i.weakTopics || []).some((t) => t.toLowerCase().includes(q))
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
  }, [interviews, search, statusFilter, targetFilter, sort]);

  const handleViewDetails = (interview) => {
    navigate(`/history/interview/${interview.id}/tests`);
  };

  const handleViewAnalysis = (test) => {
    navigate("/practice/results", { state: { attemptId: test.id } });
  };

  const mockFiltered = useMemo(() => {
    let result = [...tests];

    if (mockSearch.trim()) {
      const q = mockSearch.toLowerCase();
      result = result.filter((t) =>
          t.title.toLowerCase().includes(q) ||
          (t.weakTopics || []).some((w) => w.toLowerCase().includes(q))
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
  }, [tests, mockSearch, mockStatus, mockType, mockSort]);

  const hasData = interviews.length > 0;
  const hasMockData = tests.length > 0;

  const interviewOverview = useMemo(() => {
    const completed = interviews.filter((i) => i.status === "COMPLETED");
    const active = interviews.filter((i) => i.status === "ACTIVE");
    const successRate = completed.length
        ? Math.round(completed.reduce((s, i) => s + (i.accuracy || 0), 0) / completed.length)
        : 0;
    return { total: interviews.length, completed: completed.length, active: active.length, successRate };
  }, [interviews]);

  const mockOverview = useMemo(() => {
    const completed = tests.filter((t) => t.status === "COMPLETED");
    const avgC = completed.length ? Math.round(completed.reduce((s, t) => s + (t.confidence || 0), 0) / completed.length) : 0;
    const avgA = completed.length ? Math.round(completed.reduce((s, t) => s + (t.accuracy || 0), 0) / completed.length) : 0;
    return { total: tests.length, completed: completed.length, avgConfidence: avgC, avgAccuracy: avgA };
  }, [tests]);

  return (
      <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar
              username={username}
              targetLabel={targetLabel}
              experienceLabel={experienceLabel}
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
                    {loading ? (
                        <div className="flex justify-center py-12">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                        </div>
                    ) : (
                        <>
                          {hasMockData && (
                              <>
                                <MockHistoryOverview {...mockOverview} />
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
                              </>
                          )}
                          {mockFiltered.length > 0 ? (
                              <MockTestTimeline tests={mockFiltered} onViewAnalysis={handleViewAnalysis} />
                          ) : hasMockData ? (
                              <p className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                                No mock tests match your filters.
                              </p>
                          ) : (
                              <MockEmptyState />
                          )}
                        </>
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
                    {loading ? (
                        <div className="flex justify-center py-12">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                        </div>
                    ) : (
                        <>
                          {hasData && (
                              <>
                                <HistoryOverview {...interviewOverview} />
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
                        </>
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
