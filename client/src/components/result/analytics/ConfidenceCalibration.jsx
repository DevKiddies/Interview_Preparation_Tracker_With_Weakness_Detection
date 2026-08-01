const ORDER = ["CONFIDENT_CORRECT", "BLIND_SPOT", "CLEAR_WEAKNESS", "UNDERCONFIDENT_CORRECT", "NOT_ATTEMPTED"];

const STATE_META = {
  CONFIDENT_CORRECT: { label: "Mastered", desc: "Correct & High Confidence", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
  BLIND_SPOT: { label: "Blind Spots", desc: "Wrong But High Confidence", color: "bg-rose-500", textColor: "text-rose-500" },
  CLEAR_WEAKNESS: { label: "Clear Weakness", desc: "Wrong & Low Confidence", color: "bg-zinc-400", textColor: "text-zinc-500 dark:text-zinc-400" },
  UNDERCONFIDENT_CORRECT: { label: "Recovered", desc: "Correct But Low Confidence", color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
  NOT_ATTEMPTED: { label: "Not Attempted", desc: "Skipped", color: "bg-slate-300 dark:bg-slate-600", textColor: "text-slate-500 dark:text-slate-400" },
};

export default function ConfidenceCalibration({ results, total }) {
  const counts = {};
  ORDER.forEach((k) => (counts[k] = 0));

  results.forEach((r) => {
    if (r.confidenceState && counts[r.confidenceState] != null) {
      counts[r.confidenceState]++;
    } else if (r.correct) {
      counts.CONFIDENT_CORRECT++;
    } else {
      counts.BLIND_SPOT++;
    }
  });

  const states = ORDER.map((k) => ({ label: STATE_META[k].label, desc: STATE_META[k].desc, color: STATE_META[k].color, textColor: STATE_META[k].textColor, value: counts[k] }));

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Confidence Calibration</h3>
      <div className="grid grid-cols-5 gap-3">
        {states.map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              {total === 0 ? 0 : Math.round((s.value / total) * 100)}%
            </p>
            <p className={`mt-1 text-xs font-semibold ${s.textColor}`}>{s.label}</p>
            <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">{s.value} {descFor(s.label)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function descFor(label) {
  switch (label) {
    case "Mastered": return "questions";
    case "Blind Spots": return "questions";
    case "Weaknesses": return "questions";
    case "Recovered": return "questions";
    case "Not Attempted": return "skipped";
    default: return "";
  }
}
