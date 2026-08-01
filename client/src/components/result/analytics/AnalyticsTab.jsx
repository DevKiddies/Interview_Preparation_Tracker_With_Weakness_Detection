import ConfidenceCalibration from "./ConfidenceCalibration";
import TopicPerformance from "./TopicPerformance";
import TimePatterns from "./TimePatterns";
import LearningInsights from "./LearningInsights";

export default function AnalyticsTab({ result }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ConfidenceCalibration results={result.results} total={result.total} />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <TopicPerformance results={result.results} />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <TimePatterns timeTaken={result.timeTaken} total={result.total} results={result.results} />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <LearningInsights results={result.results} />
        </div>
      </div>
    </div>
  );
}
