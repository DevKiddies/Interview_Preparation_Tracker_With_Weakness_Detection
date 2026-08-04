// ActivityHeatmap.jsx — monthly calendar heatmap showing daily study activity.
// All data comes from /api/users/me/dashboard/activity-heatmap (real attempts),
// no synthesized values.
import { useState, useEffect, useMemo } from "react";
import {
  CalendarDays,
  Flame,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import DashboardCard from "../ui/DashboardCard";
import API_BASE from "../../utils/api.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// "Activity Level" buckets for the default metric, derived from how many
// distinct questions the user actually answered that day.
function activityLevel(questions) {
  if (questions === 0) return 0;
  if (questions <= 5) return 1;
  if (questions <= 12) return 2;
  if (questions <= 25) return 3;
  return 4;
}

const EMPTY_STATS = {
  activityLv: 0, attempts: 0, questions: 0, confidence: 0, accuracy: 0, studyMinutes: 0,
};

// Builds the "yyyy-MM-dd" key the backend uses as ActivityDayDTO.date.
function toKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const METRICS = {
  activity: {
    label: "Activity Level",
    legend: ["None", "Light", "Moderate", "Active", "Very active"],
    level: (s) => s.activityLv,
  },
  questions: {
    label: "Questions Solved",
    legend: ["0", "1–10", "11–25", "26–45", "45+"],
    level: (s) => {
      const q = s.questions;
      if (q === 0) return 0;
      if (q <= 10) return 1;
      if (q <= 25) return 2;
      if (q <= 45) return 3;
      return 4;
    },
  },
  confidence: {
    label: "Confidence Rating",
    legend: ["0%", "<40%", "40–60%", "60–80%", "80%+"],
    level: (s) => {
      if (s.questions === 0) return 0;
      const c = s.confidence;
      if (c < 40) return 1;
      if (c < 60) return 2;
      if (c < 80) return 3;
      return 4;
    },
  },
  accuracy: {
    label: "Accuracy Rate",
    legend: ["0%", "<50%", "50–70%", "70–85%", "85%+"],
    level: (s) => {
      if (s.questions === 0) return 0;
      const a = s.accuracy;
      if (a < 50) return 1;
      if (a < 70) return 2;
      if (a < 85) return 3;
      return 4;
    },
  },
  studyTime: {
    label: "Study Duration",
    legend: ["0m", "<1h", "1–2h", "2–4h", "4h+"],
    level: (s) => {
      const m = s.studyMinutes;
      if (m === 0) return 0;
      if (m < 60) return 1;
      if (m < 120) return 2;
      if (m < 240) return 3;
      return 4;
    },
  },
};

const LEVEL_COLORS = [
  "bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700/60",
  "bg-indigo-100/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200/80 dark:hover:bg-indigo-900/60",
  "bg-indigo-300 dark:bg-indigo-700/80 text-indigo-950 dark:text-indigo-100 hover:bg-indigo-400 dark:hover:bg-indigo-600",
  "bg-indigo-500 dark:bg-indigo-500 text-white hover:bg-indigo-600 dark:hover:bg-indigo-400",
  "bg-indigo-700 dark:bg-indigo-300 text-white dark:text-indigo-950 hover:bg-indigo-800 dark:hover:bg-indigo-200",
];

function buildMonth(year, month, today, metricKey, statsByDay) {
  const first = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDow = (first.getDay() + 6) % 7;
  const metric = METRICS[metricKey];

  const cells = Array(startDow).fill(null);
  const activeFlags = [];

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const isToday = date.getTime() === today.getTime();
    const isFuture = date > today;
    const stats = isFuture ? EMPTY_STATS : (statsByDay.get(toKey(year, month, d)) ?? EMPTY_STATS);
    const lv = isFuture ? 0 : metric.level(stats);
    cells.push({ date, day: d, lv, stats, isToday, isFuture, colIndex: (startDow + d - 1) % 7 });
    if (!isFuture) activeFlags.push(stats.questions > 0);
  }

  while (cells.length % 7 !== 0) cells.push(null);

  const activeDays = activeFlags.filter(Boolean).length;

  let maxStreak = 0, run = 0;
  for (const a of activeFlags) {
    if (a) { if (++run > maxStreak) maxStreak = run; } else run = 0;
  }

  let streak = 0;
  for (let i = activeFlags.length - 1; i >= 0; i--) {
    if (activeFlags[i]) streak++; else break;
  }

  return { cells, totalDays, activeDays, maxStreak, streak };
}

// Custom Styled Floating Tooltip Component
function CellTooltip({ cell }) {
  const { date, stats, isFuture } = cell;
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (isFuture) {
    return (
        <div className="text-slate-400 dark:text-slate-500 font-medium text-[10px]">
          {dateStr} — Future date
        </div>
    );
  }

  if (stats.questions === 0) {
    return (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-700 dark:text-slate-200">{dateStr}</p>
          <p className="text-slate-400 dark:text-slate-500 font-medium">No study activity logged</p>
        </div>
    );
  }

  const { questions, confidence, accuracy, studyMinutes } = stats;
  const h = Math.floor(studyMinutes / 60);
  const m = studyMinutes % 60;
  const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

  return (
      <div className="space-y-1.5 w-36">
        <div className="border-b border-slate-100 dark:border-slate-700/80 pb-1 flex items-center justify-between">
          <span className="font-bold text-slate-800 dark:text-slate-100">{dateStr}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900" />
        </div>

        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Questions</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{questions}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Confidence</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{confidence}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Accuracy</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{accuracy}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span>Time Spent</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{timeStr}</span>
          </div>
        </div>
      </div>
  );
}

function DayCell({ cell, index }) {
  if (!cell) return <div className="aspect-square" />;

  const { day, lv, isToday, isFuture, colIndex } = cell;
  const colorStyles = LEVEL_COLORS[lv];

  // Adjust tooltip positioning near the right edge to avoid clipping
  const isRightEdge = colIndex >= 5;
  const tooltipAlignClass = isRightEdge ? "right-0 translate-x-0" : "left-1/2 -translate-x-1/2";

  return (
      <div
          className={`group relative aspect-square rounded-sm flex items-center justify-center cursor-pointer select-none transition-all duration-200 ${
              isFuture
                  ? "bg-slate-100/50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-700 cursor-not-allowed"
                  : colorStyles
          } ${
              isToday
                  ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900 font-black shadow-xs"
                  : ""
          }`}
      >
        <span className="text-[10px] font-semibold tracking-tight">{day}</span>

        {/* Floating Custom Tooltip */}
        <div
            className={`pointer-events-none absolute bottom-full mb-2 ${tooltipAlignClass} z-30 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 ease-out origin-bottom`}
        >
          <div className="rounded-lg bg-white dark:bg-slate-800 p-2.5 shadow-xl border border-slate-200/80 dark:border-slate-700/80 text-[11px] whitespace-nowrap">
            <CellTooltip cell={cell} />
          </div>
        </div>
      </div>
  );
}

function CustomSelect({ value, onChange, children, className = "" }) {
  return (
      <div className="relative inline-flex items-center">
        <select
            value={value}
            onChange={onChange}
            className={`appearance-none bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-[11px] font-semibold rounded-lg pl-2.5 pr-6 py-1 cursor-pointer outline-none transition-colors border border-slate-200/60 dark:border-slate-700/60 ${className}`}
        >
          {children}
        </select>
        <ChevronDown
            size={11}
            className="pointer-events-none absolute right-2 text-slate-400 dark:text-slate-500"
        />
      </div>
  );
}

export default function ActivityHeatmap() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const maxYear = today.getFullYear();
  const minYear = maxYear - 2;

  const [selYear, setSelYear] = useState(maxYear);
  const [selMonth, setSelMonth] = useState(today.getMonth());
  const [metricKey, setMetricKey] = useState("activity");

  // Real per-day stats: dateKey ("yyyy-MM-dd") -> stat object, plus the
  // server-computed streak summary. Loaded once; the backend covers ~3 years.
  const [statsByDay, setStatsByDay] = useState(new Map());
  const [serverStreaks, setServerStreaks] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/users/me/dashboard/activity-heatmap`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
        .then((data) => {
          const map = new Map();
          for (const d of data.days ?? []) {
            map.set(d.date, {
              activityLv: activityLevel(d.questions ?? 0),
              attempts: d.attempts ?? 0,
              questions: d.questions ?? 0,
              confidence: d.confidence ?? 0,
              accuracy: d.accuracy ?? 0,
              studyMinutes: d.studyMinutes ?? 0,
            });
          }
          setStatsByDay(map);
          setServerStreaks({
            current: data.currentStreak ?? 0,
            longest: data.longestStreak ?? 0,
          });
        })
        .catch(() => { /* leave the heatmap empty rather than showing fake data */ });
  }, []);

  const isCurrent = selYear === maxYear && selMonth === today.getMonth();
  const canGoPrev = selYear > minYear || selMonth > 0;
  const canGoNext = !isCurrent;

  const navigate = (dir) => {
    const d = new Date(selYear, selMonth + dir);
    const y = d.getFullYear();
    const m = d.getMonth();
    if (y < minYear) return;
    if (y > maxYear || (y === maxYear && m > today.getMonth())) return;
    setSelYear(y);
    setSelMonth(m);
  };

  const jumpToday = () => {
    setSelYear(maxYear);
    setSelMonth(today.getMonth());
  };

  const { cells, totalDays, activeDays, maxStreak, streak } = useMemo(
      () => buildMonth(selYear, selMonth, today, metricKey, statsByDay),
      [selYear, selMonth, today, metricKey, statsByDay]
  );

  const metric = METRICS[metricKey];

  // Global streaks come from the server (computed across all fetched history);
  // the per-month streak (insight card) is still derived from the visible month.
  const globalCurrentStreak = serverStreaks.current || streak;
  const globalLongestStreak = serverStreaks.longest > maxStreak ? serverStreaks.longest : maxStreak;

  return (
      <DashboardCard
          title="Study Consistency"
          subtitle="Track daily focus, completed tasks, and retention over time"
          icon={<CalendarDays size={18} className="text-indigo-500" />}
      >
        {/* Top Bar Navigation */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <CustomSelect
                value={selMonth}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  if (selYear === maxYear && m > today.getMonth()) return;
                  setSelMonth(m);
                }}
            >
              {MONTH_NAMES.map((name, i) => (
                  <option
                      key={i}
                      value={i}
                      disabled={selYear === maxYear && i > today.getMonth()}
                  >
                    {name}
                  </option>
              ))}
            </CustomSelect>

            <CustomSelect
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
            </CustomSelect>

            {!isCurrent && (
                <button
                    onClick={jumpToday}
                    className="ml-1 rounded-md px-1.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  Today
                </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Metric:</span>
              <CustomSelect
                  value={metricKey}
                  onChange={(e) => setMetricKey(e.target.value)}
                  className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50"
              >
                {Object.entries(METRICS).map(([key, m]) => (
                    <option key={key} value={key}>{m.label}</option>
                ))}
              </CustomSelect>
            </div>

            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center gap-1">
              <button
                  onClick={() => navigate(-1)}
                  disabled={!canGoPrev}
                  aria-label="Previous month"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                  onClick={() => navigate(1)}
                  disabled={!canGoNext}
                  aria-label="Next month"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Grid Section */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              <div className="grid grid-cols-7 gap-1 mb-1.5">
                {DAY_LABELS.map((d) => (
                    <div key={d} className="text-center text-[9px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                      {d}
                    </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, i) => (
                    <DayCell key={i} index={i} cell={cell} />
                ))}
              </div>
            </div>

            {/* Dynamic Legend */}
            <div className="mt-4 flex items-center justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-indigo-500" />
              <span>{metric.label} Intensity</span>
            </span>
              <div className="flex items-center gap-1.5">
                <span className="uppercase tracking-wider">{metric.legend[0]}</span>
                <div className="flex items-center gap-0.5">
                  {LEVEL_COLORS.map((colorClass, i) => (
                      <div
                          key={i}
                          title={metric.legend[i]}
                          className={`h-2.5 w-2.5 rounded-sm ${colorClass.split(" ")[0]} border border-black/5 dark:border-white/5`}
                      />
                  ))}
                </div>
                <span className="uppercase tracking-wider">{metric.legend[metric.legend.length - 1]}</span>
              </div>
            </div>
          </div>

          {/* Right Insights Cards */}
          <div className="lg:col-span-5 flex flex-col gap-3 h-full">
            <div className="grid flex-1 grid-cols-3 gap-2.5 lg:grid-cols-1">
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/60 p-3 text-center shadow-xs lg:flex-row lg:justify-start lg:text-left lg:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500">
                  <Flame size={16} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">
                    {globalCurrentStreak}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Current Streak
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/60 p-3 text-center shadow-xs lg:flex-row lg:justify-start lg:text-left lg:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500">
                  <Trophy size={16} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">
                    {globalLongestStreak}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Longest Streak
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-800/60 p-3 text-center shadow-xs lg:flex-row lg:justify-start lg:text-left lg:gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                  <CalendarDays size={16} />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">
                    {activeDays}<span className="text-slate-400 dark:text-slate-500 font-bold">/{totalDays}</span>
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Days Studied
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardCard>
  );
}
