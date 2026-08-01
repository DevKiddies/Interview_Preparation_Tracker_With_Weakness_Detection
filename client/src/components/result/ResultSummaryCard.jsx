import { Trophy, CheckCircle2, XCircle, MinusCircle, Clock, Target } from "lucide-react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function ScoreRing({ score, total }) {
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const r = 44; // Reduced radius for a tighter ring
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444";

  return (
      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-zinc-50 shadow-inner dark:bg-zinc-950/50">
        <svg className="-rotate-90 transform transition-transform" width="112" height="112">
          <circle
              cx="56" cy="56" r={r}
              strokeWidth="7" fill="none"
              stroke="currentColor"
              className="text-zinc-200 dark:text-zinc-800"
          />
          <circle
              cx="56" cy="56" r={r}
              strokeWidth="7" fill="none"
              stroke={color}
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1.2s ease-in-out" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
        <span className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {score}
          <span className="text-sm text-zinc-400">/{total}</span>
        </span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{pct}%</span>
        </div>
      </div>
  );
}

function getPerformanceLabel(pct) {
  if (pct >= 90) return { label: "Outstanding", sub: "You've mastered this topic." };
  if (pct >= 70) return { label: "Excellent Performance", sub: "You're well prepared." };
  if (pct >= 50) return { label: "Good Effort", sub: "Keep practicing to improve further." };
  if (pct >= 30) return { label: "Needs Improvement", sub: "Focus on weak areas and retry." };
  return { label: "Keep Learning", sub: "Review fundamentals and try again." };
}

export default function ResultSummaryCard({ result }) {
  const pct = Math.round(result.accuracy);
  const perf = getPerformanceLabel(pct);

  return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6">
        <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreRing score={result.score} total={result.total} />

            <div className="flex-1 w-full">
              <div className="mb-1.5 flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Test Completed</h2>
              </div>

              <p className="mb-0.5 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{perf.label}</p>
              <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">{perf.sub}</p>
            </div>
          </div>
        </div>
      </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 py-2 px-1 shadow-sm transition-colors hover:bg-zinc-100/50 dark:border-zinc-800/50 dark:bg-zinc-800/50 dark:hover:bg-zinc-800">
        <p className={`text-lg font-extrabold ${color}`}>{value}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <Icon size={10} strokeWidth={2.5} /> {label}
        </p>
      </div>
  );
}