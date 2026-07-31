import QuestionPerformance from "./QuestionPerformance";
import ConfidencePerformance from "./ConfidencePerformance";
import TimePerformance from "./TimePerformance";
import KeyTakeaways from "./KeyTakeaways";

export default function OverviewTab({ result }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <QuestionPerformance result={result} />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ConfidencePerformance result={result} />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <TimePerformance timeTaken={result.timeTaken} total={result.total} />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <KeyTakeaways result={result} />
        </div>
      </div>
    </div>
  );
}
