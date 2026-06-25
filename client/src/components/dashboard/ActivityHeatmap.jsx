import { CalendarDays } from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

// Intensity 0-4 mapped to increasingly saturated indigo cells.
const CELL_TONES = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-indigo-200 dark:bg-indigo-900/60",
  "bg-indigo-400 dark:bg-indigo-700",
  "bg-indigo-600 dark:bg-indigo-500",
  "bg-indigo-800 dark:bg-indigo-400",
];

function Cell({ intensity }) {
  return <span className={`h-5 w-5 rounded-md ${CELL_TONES[intensity] ?? CELL_TONES[0]}`} />;
}

export default function ActivityHeatmap({ weeks, footer }) {
  return (
    <DashboardCard
      title="Activity Heatmap"
      icon={<CalendarDays size={18} className="mt-1 text-indigo-500" />}
      action={
        <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
          Last 5 weeks
        </span>
      }
    >
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1.5">
            {week.map((intensity, di) => (
              <Cell key={di} intensity={intensity} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
        <span>Less</span>
        {CELL_TONES.map((tone, i) => (
          <span key={i} className={`h-3.5 w-3.5 rounded ${tone}`} />
        ))}
        <span>More</span>
      </div>

      {footer && (
        <>
          <div className="my-5 h-px bg-slate-100 dark:bg-slate-800" />
          {footer}
        </>
      )}
    </DashboardCard>
  );
}
