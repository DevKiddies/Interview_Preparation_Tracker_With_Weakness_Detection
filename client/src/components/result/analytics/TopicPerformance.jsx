import { CheckCircle2, AlertTriangle, MinusCircle, HelpCircle, Minus } from "lucide-react";

const PATTERN_META = {
  CONFIDENT_CORRECT: {
    label: "Mastered", icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  BLIND_SPOT: {
    label: "Blind Spot", icon: AlertTriangle,
    color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10",
  },
  CLEAR_WEAKNESS: {
    label: "Weakness", icon: MinusCircle,
    color: "text-zinc-500 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-700",
  },
  UNDERCONFIDENT_CORRECT: {
    label: "Recovered", icon: HelpCircle,
    color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  NOT_ATTEMPTED: {
    label: "Not Attempted", icon: Minus,
    color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800",
  },
};

function dominantState(attempts) {
  const counts = {};
  for (const a of attempts) {
    const key = a.confidenceState && PATTERN_META[a.confidenceState]
        ? a.confidenceState
        : a.correct ? "CONFIDENT_CORRECT" : "BLIND_SPOT";
    counts[key] = (counts[key] || 0) + 1;
  }
  let best = null;
  for (const [k, v] of Object.entries(counts)) {
    if (!best || v > counts[best]) best = k;
  }
  return best || "NOT_ATTEMPTED";
}

export default function TopicPerformance({ results }) {
  const byTopic = {};
  for (const r of results) {
    const topic = r.topic || r.category || "Unknown";
    const technique = r.technique || null;
    if (!byTopic[topic]) byTopic[topic] = { attempts: [], techniques: new Set() };
    if (technique) byTopic[topic].techniques.add(technique);
    byTopic[topic].attempts.push(r);
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
              <th className="pb-2 text-left font-semibold text-zinc-500 dark:text-zinc-400">Technique</th>
              <th className="pb-2 text-center font-semibold text-zinc-500 dark:text-zinc-400">Accuracy</th>
              <th className="pb-2 text-center font-semibold text-zinc-500 dark:text-zinc-400">Confidence</th>
              <th className="pb-2 text-center font-semibold text-zinc-500 dark:text-zinc-400">Pattern</th>
            </tr>
          </thead>
          <tbody>
            {topics.map(([topic, s]) => {
              const attempts = s.attempts;
              const answered = attempts.filter((a) => a.confidenceState !== "NOT_ATTEMPTED" && a.yourAnswer != null);
              const total = attempts.length;
              const correct = attempts.filter((a) => a.correct).length;
              const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
              const confidence = answered.length === 0
                  ? null
                  : Math.round(answered.reduce((sum, a) => sum + (a.confidenceScore || 0), 0) / answered.length);
              const patternKey = dominantState(attempts);
              const pattern = PATTERN_META[patternKey];
              const PatternIcon = pattern.icon;
              const techniques = Array.from(s.techniques);

              return (
                <tr key={topic} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                  <td className="py-2.5 pr-4 font-semibold text-zinc-800 dark:text-zinc-200">{topic}</td>
                  <td className="py-2.5 pr-4 text-zinc-500 dark:text-zinc-400">
                    {techniques.length > 0 ? techniques.join(", ") : "—"}
                  </td>
                  <td className="py-2.5 text-center font-bold text-zinc-900 dark:text-white">{accuracy}%</td>
                  <td className="py-2.5 text-center font-bold text-zinc-900 dark:text-white">
                    {confidence == null ? "—" : `${confidence}%`}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${pattern.bg} ${pattern.color}`}>
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
