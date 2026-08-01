import { CheckCircle2, AlertTriangle, MinusCircle, HelpCircle, Minus } from "lucide-react";

const STATE_META = {
  CONFIDENT_CORRECT: {
    label: "Mastered", icon: CheckCircle2, color: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400", desc: "Correct & confident",
  },
  BLIND_SPOT: {
    label: "Blind Spots", icon: AlertTriangle, color: "bg-rose-500",
    textColor: "text-rose-500", desc: "Wrong but confident",
  },
  CLEAR_WEAKNESS: {
    label: "Weaknesses", icon: MinusCircle, color: "bg-zinc-400",
    textColor: "text-zinc-500 dark:text-zinc-400", desc: "Wrong & low confidence",
  },
  UNDERCONFIDENT_CORRECT: {
    label: "Under Confident", icon: HelpCircle, color: "bg-amber-500",
    textColor: "text-amber-600 dark:text-amber-400", desc: "Correct despite doubt",
  },
  NOT_ATTEMPTED: {
    label: "Not Attempted", icon: Minus, color: "bg-slate-300 dark:bg-slate-600",
    textColor: "text-slate-500 dark:text-slate-400", desc: "Skipped",
  },
};

const ORDER = ["CONFIDENT_CORRECT", "BLIND_SPOT", "CLEAR_WEAKNESS", "UNDERCONFIDENT_CORRECT", "NOT_ATTEMPTED"];

export default function ConfidencePerformance({ result }) {
  const counts = {};
  ORDER.forEach((k) => (counts[k] = 0));

  result.results.forEach((r) => {
    if (r.confidenceState && counts[r.confidenceState] != null) {
      counts[r.confidenceState]++;
    } else if (r.correct) {
      counts.CONFIDENT_CORRECT++;
    } else {
      counts.BLIND_SPOT++;
    }
  });

  const states = ORDER.map((k) => ({ key: k, ...STATE_META[k], value: counts[k] }));
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
