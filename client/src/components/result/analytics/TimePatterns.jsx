function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function TimePatterns({ timeTaken, total, results }) {
  const avg = total === 0 ? 0 : Math.round(timeTaken / total);

  const byDifficulty = {};
  for (const r of results) {
    const d = r.difficulty || "Unknown";
    if (!byDifficulty[d]) byDifficulty[d] = { correct: 0, total: 0 };
    byDifficulty[d].total++;
    if (r.correct) byDifficulty[d].correct++;
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Time Analysis</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{formatTime(timeTaken)}</p>
          <p className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Time</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{avg}s</p>
          <p className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Avg / Question</p>
        </div>
      </div>

      {Object.keys(byDifficulty).length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">Accuracy by Difficulty</p>
          <div className="space-y-2">
            {Object.entries(byDifficulty).map(([diff, s]) => {
              const pct = s.total === 0 ? 0 : Math.round((s.correct / s.total) * 100);
              const barColor = diff.toLowerCase() === "easy"
                ? "bg-emerald-500"
                : diff.toLowerCase() === "medium"
                ? "bg-amber-500"
                : "bg-rose-500";
              return (
                <div key={diff} className="flex items-center gap-3">
                  <span className="w-14 text-xs font-semibold text-zinc-600 dark:text-zinc-400">{diff}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
