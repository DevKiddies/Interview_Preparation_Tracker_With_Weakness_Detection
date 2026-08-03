import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api.js";

import ResultSummaryCard from "../components/result/ResultSummaryCard";
import ResultTabs from "../components/result/ResultTabs";
import OverviewTab from "../components/result/overview/OverviewTab";
import AnalyticsTab from "../components/result/analytics/AnalyticsTab";
import ReviewTab from "../components/result/review/ReviewTab";
import BottomActions from "../components/result/BottomActions";

export default function TestResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result ?? null);
  const testTitle   = location.state?.testTitle   ?? "Assessment Results";
  const retakeUrl   = location.state?.retakeUrl   ?? "/practice/mock-tests/dsa";
  const retakeState = location.state?.retakeState ?? null;

  const attemptId =
    location.state?.attemptId ?? new URLSearchParams(location.search).get("attemptId");

  const [loading, setLoading] = useState(!location.state?.result && Boolean(attemptId));
  const [loadError, setLoadError] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (location.state?.result) return;
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    setLoadError(false);

    const loadAttempt = (id) =>
      fetch(`${API_BASE}/api/tests/attempts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        if (!res.ok) throw new Error("load failed");
        return res.json();
      });

    if (attemptId) {
      loadAttempt(attemptId)
          .then((data) => setResult(data))
          .catch(() => setLoadError(true))
          .finally(() => setLoading(false));
      return;
    }

    // No attempt id (e.g. a TEST_RESULT notification created before links
    // carried the id) — fall back to the most recent attempt's full result.
    fetch(`${API_BASE}/api/tests/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          const latest = Array.isArray(data) && data.length > 0 ? data[0].id : null;
          if (!latest) throw new Error("no attempts");
          return loadAttempt(latest);
        })
        .then((data) => setResult(data))
        .catch(() => setLoadError(true))
        .finally(() => setLoading(false));
  }, [attemptId, location.state?.result, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading your results…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">
          {loadError ? "Couldn't load your results. Please try again." : "No result data found."}
        </p>
        <button
          onClick={() => navigate("/practice/mock-tests")}
          className="rounded-xl bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const wrong = result.results.filter((r) => r.yourAnswer != null && !r.correct).length;

  return (
    <div className="min-h-screen bg-zinc-50 transition-colors duration-200 dark:bg-zinc-950">

      <ResultSummaryCard result={result} />

      <ResultTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" && (
        <OverviewTab result={result} retakeUrl={retakeUrl} retakeState={retakeState} />
      )}

      {activeTab === "analytics" && (
        <AnalyticsTab result={result} />
      )}

      {activeTab === "review" && (
        <ReviewTab results={result.results} total={result.total} wrong={wrong} />
      )}

      <BottomActions retakeUrl={retakeUrl} retakeState={retakeState} />
    </div>
  );
}
