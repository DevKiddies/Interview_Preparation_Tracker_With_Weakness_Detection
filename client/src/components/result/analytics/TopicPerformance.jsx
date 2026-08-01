import { CheckCircle2, AlertTriangle, MinusCircle, HelpCircle } from "lucide-react";

function getDominantPattern(correct, wrong, skipped) {
  const total = correct + wrong + skipped;
  if (total === 0) return { label: "--", icon: HelpCircle, color: "text-zinc-400" };

  const accuracy = correct / total;
  const confidence = (correct + wrong) / total;

  if (accuracy >= 0.7 && confidence >= 0.7) return { label: "Mastered", icon: CheckCircle2, color: "text-emerald-500" };
  if (accuracy < 0.7 && confidence >= 0.7) return { label: "Blind Spot", icon: AlertTriangle, color: "text-rose-500" };
  if (accuracy < 0.7 && confidence < 0.7) return { label: "Weakness", icon: MinusCircle, color: "text-zinc-400" };
  return { label: "Recovered", icon: HelpCircle, color: "text-amber-500" };
}

export default function TopicPerformance({ results }) {
  const byTopic = {};
  for (const r of results) {
    const cat = r.category || "Unknown";
    if (!byTopic[cat]) byTopic[cat] = { correct: 0, wrong: 0, skipped: 0 };
    if (r.yourAnswer == null) byTopic[cat].skipped++;
    else if (r.correct) byTopic[cat].correct++;
    else byTopic[cat].wrong++;
  }

  const topics = Object.entries(byTopic);

  if (topics.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Topic &amp; Technique Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700">
              <th className="pb-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Topic</th>
              <th className="pb-2 text-center font-semibold text-zinc-500 dark:text-zinc-400">Accuracy</th>
              <th className="pb-2 text-center font-semibold text-zinc-500 dark:text-zinc-400">Confidence</th>
              <th className="pb-2 text-center font-semibold text-zinc-500 dark:text-zinc-400">Pattern</th>
            </tr>
          </thead>
          <tbody>
            {topics.map(([topic, s]) => {
              const total = s.correct + s.wrong + s.skipped;
              const accuracy = total === 0 ? 0 : Math.round((s.correct / total) * 100);
              const confidence = total === 0 ? 0 : Math.round(((s.correct + s.wrong) / total) * 100);
              const pattern = getDominantPattern(s.correct, s.wrong, s.skipped);
              const PatternIcon = pattern.icon;

              return (
                <tr key={topic} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="py-2.5 pr-4 font-semibold text-zinc-800 dark:text-zinc-200">{topic}</td>
                  <td className="py-2.5 text-center font-bold text-zinc-900 dark:text-white">{accuracy}%</td>
                  <td className="py-2.5 text-center font-bold text-zinc-900 dark:text-white">{confidence}%</td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                      pattern.label === "Mastered" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                      pattern.label === "Blind Spot" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" :
                      pattern.label === "Weakness" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      <PatternIcon size={10} /> {pattern.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
