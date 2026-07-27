// ActivityHeatmap.jsx — monthly calendar heatmap showing daily activity intensity.
// Uses synthetic (deterministic pseudo-random) data until the real activity API is ready.
// The user can navigate between months and years using the picker controls.

import { useState, useMemo } from "react";
import {
  CalendarDays, Flame, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown,
} from "lucide-react";
import DashboardCard from "../ui/DashboardCard";

const CELL = 34;
const GAP  = 4;
const COL  = `repeat(7, ${CELL}px)`;

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const ACT_LABEL   = ["No activity","Light","Moderate","Active","Very active"];

const LEVEL = [
  ["bg-slate-100 dark:bg-slate-800",          "text-slate-400 dark:text-slate-500"],
  ["bg-indigo-100 dark:bg-indigo-950",         "text-indigo-600 dark:text-indigo-400"],
  ["bg-indigo-300 dark:bg-indigo-700",         "text-indigo-900 dark:text-white"],
  ["bg-indigo-500 dark:bg-indigo-500",         "text-white"],
  ["bg-indigo-700 dark:bg-indigo-300",         "text-white dark:text-indigo-900"],
];

// Deterministic pseudo-random from a numeric seed — the same date always returns
// the same value, so the heatmap looks consistent across re-renders without any API call.
function drand(s) {
  const x = Math.sin(s * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
function syntheticLv(date) {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const r = drand(seed);
  if (r < 0.45) return 0;
  if (r < 0.65) return 1;
  if (r < 0.82) return 2;
  if (r < 0.94) return 3;
  return 4;
}

function buildMonth(year, month, today) {
  const first      = new Date(year, month, 1);
  const totalDays  = new Date(year, month + 1, 0).getDate();
  // JS getDay() returns 0 = Sunday; shift so Monday = 0 to match the grid header.
  const startDow   = (first.getDay() + 6) % 7;

  // Pad the start of the grid with empty cells so day 1 falls in the right column.
  const cells = Array(startDow).fill(null);
  const vals  = [];

  for (let d = 1; d <= totalDays; d++) {
    const date     = new Date(year, month, d);
    const isToday  = date.getTime() === today.getTime();
    const isFuture = date > today;
    const lv       = isFuture ? 0 : syntheticLv(date);
    cells.push({ date, day: d, lv, isToday, isFuture });
    if (!isFuture) vals.push(lv);
  }

  // Pad the end so the grid always has complete rows (each row = 1 week).
  while (cells.length % 7 !== 0) cells.push(null);

  const activeDays  = vals.filter((v) => v > 0).length;
  const totalPoints = vals.reduce((s, v) => s + v, 0);

  let maxStreak = 0, run = 0;
  for (const v of vals) { if (v > 0) { if (++run > maxStreak) maxStreak = run; } else run = 0; }

  let streak = 0;
  for (let i = vals.length - 1; i >= 0; i--) { if (vals[i] > 0) streak++; else break; }

  return { cells, totalDays, activeDays, totalPoints, maxStreak, streak };
}

function DayCell({ cell }) {
  if (!cell) return <div className="aspect-square" />;

  const { date, day, lv, isToday, isFuture } = cell;
  const tip  = `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${ACT_LABEL[lv]}`;
  const [bg, text] = LEVEL[lv];

  return (
    <div
      title={tip}
      className={[
        "aspect-square rounded-lg flex items-center justify-center cursor-default select-none",
        "transition-transform duration-150 hover:scale-110",
        isFuture ? "opacity-25 bg-slate-100 dark:bg-slate-800" : bg,
        isToday  ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 shadow-indigo-400/30 shadow-md" : "",
      ].join(" ")}
    >
      <span className={`text-[11px] font-bold leading-none ${isFuture ? "text-slate-400" : text}`}>
        {day}
      </span>
    </div>
  );
}

function PickerSelect({ value, onChange, children, accent }) {
  const base = accent
    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200";
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={onChange}
        className={`appearance-none ${base} text-sm font-bold rounded-xl pl-3 pr-7 py-1.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors`}
      >
        {children}
      </select>
      <ChevronDown
        size={11}
        className={`pointer-events-none absolute right-2 ${accent ? "text-indigo-500" : "text-slate-400"}`}
      />
    </div>
  );
}

export default function ActivityHeatmap({ footer }) {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const maxYear  = today.getFullYear();
  const minYear  = maxYear - 2;

  const [selYear,  setSelYear]  = useState(maxYear);
  const [selMonth, setSelMonth] = useState(today.getMonth());

  const isCurrent  = selYear === maxYear && selMonth === today.getMonth();
  const canGoPrev  = selYear > minYear || selMonth > 0;
  const canGoNext  = !isCurrent;

  const navigate = (dir) => {
    const d = new Date(selYear, selMonth + dir);
    const y = d.getFullYear(); const m = d.getMonth();
    if (y < minYear) return;
    if (y > maxYear || (y === maxYear && m > today.getMonth())) return;
    setSelYear(y); setSelMonth(m);
  };

  const jumpToday = () => { setSelYear(maxYear); setSelMonth(today.getMonth()); };

  const { cells, totalDays, activeDays, totalPoints, maxStreak, streak } = useMemo(
    () => buildMonth(selYear, selMonth, today),
    [selYear, selMonth, today],
  );

  const activePercent = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  return (
    <DashboardCard
      title="Activity Heatmap"
      icon={<CalendarDays size={18} className="mt-1 text-indigo-500" />}
    >

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <PickerSelect
            accent
            value={selMonth}
            onChange={(e) => {
              const m = Number(e.target.value);
              if (selYear === maxYear && m > today.getMonth()) return;
              setSelMonth(m);
            }}
          >
            {MONTH_NAMES.map((name, i) => (
              <option
                key={i} value={i}
                disabled={selYear === maxYear && i > today.getMonth()}
              >
                {name}
              </option>
            ))}
          </PickerSelect>

          <PickerSelect
            value={selYear}
            onChange={(e) => {
              const y = Number(e.target.value);
              setSelYear(y);
              if (y === maxYear && selMonth > today.getMonth()) setSelMonth(today.getMonth());
            }}
          >
            {Array.from({ length: 3 }, (_, i) => minYear + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </PickerSelect>

          {!isCurrent && (
            <button
              onClick={jumpToday}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => navigate(-1)}
            disabled={!canGoPrev}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => navigate(1)}
            disabled={!canGoNext}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold">
          <span className="text-slate-500 dark:text-slate-400">
            <span className="text-slate-900 dark:text-white">{activeDays}</span>
            {" "}of {totalDays} days active
          </span>
          <span className="text-indigo-600 dark:text-indigo-400">{activePercent}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-1.5 rounded-full bg-indigo-500 transition-all duration-700"
            style={{ width: `${activePercent}%` }}
          />
        </div>
      </div>

      <div
        className="mx-auto mb-1 grid"
        style={{ gridTemplateColumns: COL, gap: GAP }}
      >
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {d}
          </div>
        ))}
      </div>

      <div
        className="mx-auto grid"
        style={{ gridTemplateColumns: COL, gap: GAP }}
      >
        {cells.map((cell, i) => (
          <DayCell key={i} cell={cell} />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
        <span>Less</span>
        {LEVEL.map(([bg], i) => (
          <div key={i} title={ACT_LABEL[i]} className={`h-2.5 w-2.5 rounded-sm ${bg}`} />
        ))}
        <span>More</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
        <div className="text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1">
            <Flame size={14} className="shrink-0 text-amber-500" />
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{streak}</p>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Day Streak</p>
        </div>
        <div className="text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{totalPoints}</p>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Total Points</p>
        </div>
        <div className="text-center">
          <div className="mb-0.5 flex items-center justify-center gap-1">
            <Flame size={14} className="shrink-0 text-rose-500" />
            <p className="text-base font-extrabold text-slate-900 dark:text-white">{maxStreak}</p>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Max Streak</p>
        </div>
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
