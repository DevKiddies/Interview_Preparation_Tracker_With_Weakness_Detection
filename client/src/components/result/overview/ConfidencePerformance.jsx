import { CheckCircle2, AlertTriangle, MinusCircle, HelpCircle } from "lucide-react";

export default function ConfidencePerformance({ result }) {
  const wrong = result.results.filter((r) => r.yourAnswer != null && !r.correct).length;
  const skipped = result.results.filter((r) => r.yourAnswer == null).length;
  const correct = result.score;

  const states = [
    { label: "Mastered", value: correct, icon: CheckCircle2, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", desc: "Correct & confident" },
    { label: "Blind Spots", value: wrong, icon: AlertTriangle, color: "bg-rose-500", textColor: "text-rose-500", desc: "Wrong but confident" },
    { label: "Weaknesses", value: skipped, icon: MinusCircle, color: "bg-zinc-400", textColor: "text-zinc-500 dark:text-zinc-400", desc: "Knew you didn't know" },
    { label: "Under Confident", value: 0, icon: HelpCircle, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", desc: "Correct despite doubt" },
  ];

  const maxVal = Math.max(...states.map((s) => s.value), 1);

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Confidence Performance</h3>
      <div className="space-y-3">
        {states.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-32 shrink-0">
              <p className={`flex items-center gap-1.5 text-xs font-semibold ${s.textColor}`}>
                <s.icon size={12} /> {s.label}
              </p>
            </div>
            <div className="flex-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${s.color}`}
                  style={{ width: `${(s.value / maxVal) * 100}%` }}
                />
              </div>
            </div>
            <span className="w-8 text-right text-xs font-bold text-zinc-700 dark:text-zinc-300">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
