import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import ResultSummaryCard from "../components/result/ResultSummaryCard";
import ResultTabs from "../components/result/ResultTabs";
import OverviewTab from "../components/result/overview/OverviewTab";
import AnalyticsTab from "../components/result/analytics/AnalyticsTab";
import ReviewTab from "../components/result/review/ReviewTab";
import BottomActions from "../components/result/BottomActions";

export default function TestResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result      = location.state?.result;
  const testTitle   = location.state?.testTitle   ?? "Assessment Results";
  const retakeUrl   = location.state?.retakeUrl   ?? "/practice/mock-tests/dsa";
  const retakeState = location.state?.retakeState ?? null;

  const [activeTab, setActiveTab] = useState("overview");

  if (!result) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">No result data found.</p>
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
