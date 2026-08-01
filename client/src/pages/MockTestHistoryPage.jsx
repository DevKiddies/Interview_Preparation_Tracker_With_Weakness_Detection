import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../components/mocktest-history/PageHeader";
import InterviewSummaryCard from "../components/mocktest-history/InterviewSummaryCard";
import HistoryOverview from "../components/mocktest-history/HistoryOverview";
import HistoryFilters from "../components/mocktest-history/HistoryFilters";
import MockTestTimeline from "../components/mocktest-history/MockTestTimeline";
import EmptyState from "../components/mocktest-history/EmptyState";
import API_BASE from "../utils/api";
import { MOCK_TESTS } from "../data/mockTestData";

function MockTestHistoryPage() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch(() => {});
  }, []);

  const daysLeft = useMemo(() => {
    if (!profile?.interviewDate) return null;
    const target = new Date(profile.interviewDate);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target - today) / (1000 * 3600 * 24));
    return diff >= 0 ? diff : 0;
  }, [profile?.interviewDate]);

  const filtered = useMemo(() => {
    let result = [...MOCK_TESTS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
          t.title.toLowerCase().includes(q) ||
          t.weakTopics.some((w) => w.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== "All") result = result.filter((t) => t.status === statusFilter.toUpperCase());
    if (typeFilter !== "All") result = result.filter((t) => t.type === (typeFilter === "Mock Test" ? "MOCK" : "TOPIC"));

    result.sort((a, b) => {
      switch (sort) {
        case "Oldest": return new Date(a.completedAt) - new Date(b.completedAt);
        case "Highest Accuracy": return (b.accuracy || 0) - (a.accuracy || 0);
        case "Highest Confidence": return (b.confidence || 0) - (a.confidence || 0);
        default: return new Date(b.completedAt) - new Date(a.completedAt);
      }
    });

    return result;
  }, [search, statusFilter, typeFilter, sort]);

  const overview = useMemo(() => {
    const completed = MOCK_TESTS.filter((t) => t.status === "COMPLETED");
    const totalQ = completed.reduce((s, t) => s + (t.questionCount || 0), 0);
    const avgC = completed.length ? Math.round(completed.reduce((s, t) => s + (t.confidence || 0), 0) / completed.length) : 0;
    const avgA = completed.length ? Math.round(completed.reduce((s, t) => s + (t.accuracy || 0), 0) / completed.length) : 0;
    return { total: MOCK_TESTS.length, questionsSolved: totalQ, avgConfidence: avgC, avgAccuracy: avgA };
  }, []);

  const handleViewAnalysis = (test) => {
    navigate("/practice/results", { state: { attemptId: test.id } });
  };

  const hasData = MOCK_TESTS.length > 0;

  return (
      <div className="min-h-screen bg-indigo-50/40 transition-colors duration-200 dark:bg-slate-950">
        {/* Reduced container padding to py-4 and stack gaps to space-y-4 */}
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 space-y-4">
          <PageHeader />

          <InterviewSummaryCard
              targetCompany={profile?.targetCompany}
              experienceLevel={profile?.experienceLevel}
              interviewDate={profile?.interviewDate}
              status={daysLeft === 0 ? "COMPLETED" : "ACTIVE"}
          />

          {hasData && (
              <>
                <HistoryOverview {...overview} />
                <HistoryFilters
                    search={search}
                    onSearchChange={setSearch}
                    status={statusFilter}
                    onStatusChange={setStatusFilter}
                    type={typeFilter}
                    onTypeChange={setTypeFilter}
                    sort={sort}
                    onSortChange={setSort}
                />
              </>
          )}

          {filtered.length > 0
              ? <MockTestTimeline tests={filtered} onViewAnalysis={handleViewAnalysis} />
              : hasData
                  ? <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-10">No tests match your filters.</p>
                  : <EmptyState />
          }
        </div>
      </div>
  );
}

export default MockTestHistoryPage;