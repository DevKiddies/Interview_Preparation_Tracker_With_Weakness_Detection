export default function LearningInsights({ results }) {
  const byTopic = {};
  for (const r of results) {
    const cat = r.category || "Unknown";
    if (!byTopic[cat]) byTopic[cat] = { correct: 0, wrong: 0, skipped: 0 };
    if (r.yourAnswer == null) byTopic[cat].skipped++;
    else if (r.correct) byTopic[cat].correct++;
    else byTopic[cat].wrong++;
  }

  const entries = Object.entries(byTopic);
  if (entries.length === 0) return null;

  const worst = [...entries].sort((a, b) => {
    const pctA = a[1].correct + a[1].wrong + a[1].skipped === 0 ? 100 : a[1].correct / (a[1].correct + a[1].wrong + a[1].skipped);
    const pctB = b[1].correct + b[1].wrong + b[1].skipped === 0 ? 100 : b[1].correct / (b[1].correct + b[1].wrong + b[1].skipped);
    return pctA - pctB;
  });
  const best = [...worst].reverse();

  const mostWrong = [...entries].sort((a, b) => b[1].wrong - a[1].wrong)[0];
  const mostSkipped = [...entries].sort((a, b) => b[1].skipped - a[1].skipped)[0];

  const insights = [];

  if (best[0] && best[0][1].correct > 0) {
    const pct = Math.round((best[0][1].correct / (best[0][1].correct + best[0][1].wrong + best[0][1].skipped)) * 100);
    insights.push({ label: "Highest Accuracy", value: best[0][0], detail: `${pct}%` });
  }

  if (worst[0] && worst[0][1].wrong + worst[0][1].skipped > 0) {
    const pct = Math.round((worst[0][1].correct / (worst[0][1].correct + worst[0][1].wrong + worst[0][1].skipped)) * 100);
    insights.push({ label: "Needs Most Work", value: worst[0][0], detail: `${pct}% accuracy` });
  }

  if (mostWrong && mostWrong[1].wrong > 0) {
    insights.push({ label: "Most Blind Spots", value: mostWrong[0], detail: `${mostWrong[1].wrong} wrong` });
  }

  if (mostSkipped && mostSkipped[1].skipped > 0) {
    insights.push({ label: "Most Skipped", value: mostSkipped[0], detail: `${mostSkipped[1].skipped} skipped` });
  }

  if (insights.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Learning Insights</h3>
      <div className="grid grid-cols-2 gap-3">
        {insights.map((insight) => (
          <div key={insight.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{insight.label}</p>
            <p className="mt-1 text-sm font-extrabold text-zinc-900 dark:text-white">{insight.value}</p>
            <p className="text-[10px] text-zinc-400">{insight.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
