import { useState, useMemo } from "react";
import ReviewFilters from "./ReviewFilters";
import QuestionReviewCard from "./QuestionReviewCard";

export default function ReviewTab({ results, total, wrong }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [search, setSearch] = useState("");

  const difficulties = useMemo(() => {
    const set = new Set();
    results.forEach((r) => { if (r.difficulty) set.add(r.difficulty); });
    return [...set];
  }, [results]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (statusFilter === "correct" && !r.correct) return false;
      if (statusFilter === "wrong" && (r.correct || r.yourAnswer == null)) return false;
      if (statusFilter === "skipped" && r.yourAnswer != null) return false;
      if (difficultyFilter && r.difficulty !== difficultyFilter) return false;
      if (search && !r.text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [results, statusFilter, difficultyFilter, search]);

  const skipped = results.filter((r) => r.yourAnswer == null).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Answer Review</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
              {results.filter((r) => r.correct).length}
            </span>
            <span className="flex items-center gap-1 font-semibold text-rose-500">
              {wrong}
            </span>
            <span className="flex items-center gap-1 font-semibold text-zinc-400">
              {skipped}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <ReviewFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            search={search}
            setSearch={setSearch}
            difficulties={difficulties}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No questions match the selected filters.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((r, i) => (
              <QuestionReviewCard key={r.id} result={r} index={results.indexOf(r)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
