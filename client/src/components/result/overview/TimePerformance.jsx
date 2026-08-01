function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} sec`;
  return `${m}m ${s}s`;
}

export default function TimePerformance({ timeTaken, total }) {
  const avg = total === 0 ? 0 : Math.round(timeTaken / total);

  const items = [
    { label: "Total Time", value: formatTime(timeTaken) },
    { label: "Avg / Question", value: `${avg} sec` },
  ];

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Time Performance</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-lg font-extrabold text-zinc-900 dark:text-white">{item.value}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
