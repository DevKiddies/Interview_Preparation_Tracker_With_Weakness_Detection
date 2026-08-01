import { CheckCircle2, XCircle, MinusCircle, Target, Zap } from "lucide-react";

export default function QuestionPerformance({ result }) {
  const wrong = result.results.filter((r) => r.yourAnswer != null && !r.correct).length;
  const skipped = result.results.filter((r) => r.yourAnswer == null).length;
  const answered = result.results.filter((r) => r.confidenceState !== "NOT_ATTEMPTED");
  const confidence = answered.length === 0
    ? 0
    : Math.round(answered.reduce((sum, r) => sum + (r.confidenceScore ?? 0), 0) / answered.length);

  const cards = [
    { label: "Correct", value: result.score, icon: CheckCircle2, valueClass: "text-zinc-900 dark:text-white" },
    { label: "Wrong", value: wrong, icon: XCircle, valueClass: "text-rose-500" },
    { label: "Skipped", value: skipped, icon: MinusCircle, valueClass: "text-zinc-400" },
    { label: "Accuracy", value: `${result.accuracy}%`, icon: Target, valueClass: "text-zinc-900 dark:text-white" },
    { label: "Confidence", value: `${confidence}%`, icon: Zap, valueClass: "text-zinc-900 dark:text-white" },
  ];

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Question Performance</h3>
      <div className="grid grid-cols-5 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className={`text-2xl font-extrabold ${card.valueClass}`}>{card.value}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <card.icon size={12} /> {card.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
