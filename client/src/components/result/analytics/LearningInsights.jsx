export default function LearningInsights({ results }) {
  const byTopic = {};
  for (const r of results) {
    const topic = r.topic || r.category || "Unknown";
    if (!byTopic[topic]) byTopic[topic] = { attempts: [] };
    byTopic[topic].attempts.push(r);
  }

  const entries = Object.entries(byTopic);
  if (entries.length === 0) return null;

  const stats = entries.map(([topic, s]) => {
    const attempts = s.attempts;
    const total = attempts.length;
    const answered = attempts.filter((a) => a.confidenceState !== "NOT_ATTEMPTED" && a.yourAnswer != null);
    const correct = attempts.filter((a) => a.correct).length;
    const wrong = attempts.filter((a) => a.yourAnswer != null && !a.correct).length;
    const skipped = attempts.filter((a) => a.yourAnswer == null).length;
    const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
    const confidence = answered.length === 0
        ? null
        : Math.round(answered.reduce((sum, a) => sum + (a.confidenceScore || 0), 0) / answered.length);
    const blindSpots = attempts.filter((a) => a.confidenceState === "BLIND_SPOT").length;
    const weaknesses = attempts.filter((a) => a.confidenceState === "CLEAR_WEAKNESS").length;
    return { topic, correct, wrong, skipped, accuracy, confidence, blindSpots, weaknesses };
  });

  const insights = [];

  const best = [...stats].sort((a, b) => b.accuracy - a.accuracy)[0];
  if (best && best.correct > 0) {
    insights.push({ label: "Highest Accuracy", value: best.topic, detail: `${best.accuracy}%` });
  }

  const worst = [...stats].sort((a, b) => a.accuracy - b.accuracy)[0];
  if (worst && worst.wrong + worst.skipped > 0) {
    insights.push({ label: "Needs Most Work", value: worst.topic, detail: `${worst.accuracy}% accuracy` });
  }

  const mostBlind = [...stats].sort((a, b) => b.blindSpots - a.blindSpots)[0];
  if (mostBlind && mostBlind.blindSpots > 0) {
    insights.push({ label: "Most Blind Spots", value: mostBlind.topic, detail: `${mostBlind.blindSpots} wrong with high confidence` });
  }

  const mostWeak = [...stats].sort((a, b) => b.weaknesses - a.weaknesses)[0];
  if (mostWeak && mostWeak.weaknesses > 0) {
    insights.push({ label: "Clear Weaknesses", value: mostWeak.topic, detail: `${mostWeak.weaknesses} wrong with low confidence` });
  }

  const mostSkipped = [...stats].sort((a, b) => b.skipped - a.skipped)[0];
  if (mostSkipped && mostSkipped.skipped > 0) {
    insights.push({ label: "Most Skipped", value: mostSkipped.topic, detail: `${mostSkipped.skipped} skipped` });
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
