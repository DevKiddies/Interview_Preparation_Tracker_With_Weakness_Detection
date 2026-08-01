export default function ConfidenceCalibration({ results, score, total }) {
  const wrong = results.filter((r) => r.yourAnswer != null && !r.correct).length;
  const skipped = results.filter((r) => r.yourAnswer == null).length;

  const mastered = score;
  const blindSpots = wrong;
  const weaknesses = skipped;
  const recovered = 0;

  const states = [
    { label: "Mastered", value: mastered, desc: "Correct & confident", color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Blind Spots", value: blindSpots, desc: "Wrong but confident", color: "bg-rose-500", textColor: "text-rose-500" },
    { label: "Weaknesses", value: weaknesses, desc: "Knew you didn't know", color: "bg-zinc-400", textColor: "text-zinc-500 dark:text-zinc-400" },
    { label: "Recovered", value: recovered, desc: "Correct despite doubt", color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
  ];

  const maxVal = Math.max(...states.map((s) => s.value), 1);

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Confidence Calibration</h3>
      <div className="grid grid-cols-4 gap-3">
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
    case "Weaknesses": return "skipped";
    case "Recovered": return "questions";
    default: return "";
  }
}
