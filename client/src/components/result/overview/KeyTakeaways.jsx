import { CheckCircle2, AlertTriangle, MinusCircle, Clock } from "lucide-react";

export default function KeyTakeaways({ result }) {
  const wrong = result.results.filter((r) => r.yourAnswer != null && !r.correct).length;
  const skipped = result.results.filter((r) => r.yourAnswer == null).length;
  const avg = result.total === 0 ? 0 : Math.round(result.timeTaken / result.total);

  const items = [
    { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/5", label: "Accuracy", text: `You solved ${result.accuracy}% correctly.` },
    { icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/5", label: "Mistakes", text: `${wrong} blind spot${wrong !== 1 ? "s" : ""} — answered but wrong.` },
    { icon: MinusCircle, color: "text-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-800", label: "Skipped", text: `${skipped} question${skipped !== 1 ? "s" : ""} not attempted.` },
    { icon: Clock, color: "text-zinc-500", bg: "bg-zinc-50 dark:bg-zinc-800", label: "Pace", text: `${avg}s average per question.` },
  ];

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-zinc-900 dark:text-white">Key Takeaways</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`flex items-start gap-3 rounded-xl ${item.bg} p-3`}>
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.color}`}>
                <Icon size={14} />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white">{item.label}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
