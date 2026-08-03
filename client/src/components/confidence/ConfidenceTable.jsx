import { useState } from "react";
import { ChevronRight, ExternalLink, Search, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

const TIERS = [
  { key: "attention", min: 0, max: 40, bar: "bg-rose-500", badge: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400", label: "Needs attention" },
  { key: "practice", min: 40, max: 60, bar: "bg-amber-500", badge: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", label: "Needs practice" },
  { key: "getting-there", min: 60, max: 80, bar: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400", label: "Getting there" },
  { key: "strong", min: 80, max: 101, bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", label: "Strong" },
];

const NO_DATA_KEY = "no-data";
const NO_DATA_BADGE = "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500";

const STATUS_OPTIONS = [
  { key: "all", label: "All statuses" },
  ...TIERS.map((t) => ({ key: t.key, label: t.label })),
  { key: NO_DATA_KEY, label: "No data" },
];

function getTier(accuracy) {
  if (accuracy == null) return null;
  return TIERS.find((t) => accuracy >= t.min && accuracy < t.max) || TIERS[TIERS.length - 1];
}

function getSortValue(item, key) {
  switch (key) {
    case "name": return item.name;
    case "status": return getStatusRank(item.accuracy);
    case "progress":
    case "accuracy": return item.accuracy;
    case "confidence": return item.confidence;
    case "questions": return item.questions;
    default: return null;
  }
}

function getStatusRank(accuracy) {
  const tier = getTier(accuracy);
  return tier ? TIERS.findIndex((t) => t.key === tier.key) : TIERS.length;
}

function StatusTag({ tier, hasData }) {
  return (
      <span
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${hasData ? tier.badge : NO_DATA_BADGE}`}
          title={hasData ? tier.label : "No data"}
      >
        {hasData ? tier.label : "No data"}
      </span>
  );
}

function SortIcon({ state }) {
  if (state === "asc") return <ArrowUp size={11} className="text-indigo-500" />;
  if (state === "desc") return <ArrowDown size={11} className="text-indigo-500" />;
  return <ChevronsUpDown size={11} className="text-slate-300 dark:text-slate-600" />;
}

function SortableHeader({ label, sortable, sortKey, sortDir, onSort }) {
  const active = sortKey === sortable;
  return (
      <th
          onClick={() => sortable && onSort(sortable)}
          className={`px-3.5 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition-colors dark:text-slate-500 ${
              sortable ? "cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300" : ""
          }`}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {sortable && <SortIcon state={active ? sortDir : "normal"} />}
        </span>
      </th>
  );
}

export default function ConfidenceTable({ items, childLevel, onItemClick }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("normal");

  if (!items || items.length === 0) return null;

  const q = query.trim().toLowerCase();
  let rows = items.filter((item) => {
    if (q && !item.name.toLowerCase().includes(q)) return false;
    const tier = getTier(item.accuracy);
    if (status === "all") return true;
    if (status === NO_DATA_KEY) return tier === null;
    return tier !== null && tier.key === status;
  });

  if (sortKey && sortDir !== "normal") {
    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      const na = va == null;
      const nb = vb == null;
      if (na && nb) return 0;
      if (na) return 1; // nulls always last
      if (nb) return -1;
      if (typeof va === "string") return dir * va.localeCompare(vb);
      return dir * (va - vb);
    });
  }

  const cycleSort = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "normal") {
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortDir("normal");
    }
  };

  return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Filter bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
              <Search size={14} className="text-slate-400" />
            </div>
            <input
                type="search"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 w-full rounded-md border border-slate-200/80 bg-slate-50/50 pl-8 pr-2 text-xs text-slate-900 placeholder:text-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500/30 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>

          <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`h-8 shrink-0 cursor-pointer appearance-none rounded-md border px-2.5 pr-7 text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${
                  status !== "all"
                      ? "border-indigo-500/40 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                      : "border-slate-200/80 bg-slate-50/50 text-slate-600 hover:bg-slate-100/80 dark:border-slate-700/60 dark:bg-slate-800/50 dark:text-slate-300"
              }`}
          >
            {STATUS_OPTIONS.map((o) => (
                <option key={o.key} value={o.key} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                  {o.label}
                </option>
            ))}
          </select>

          <span className="hidden shrink-0 text-[11px] tabular-nums text-slate-400 sm:inline">
            {rows.length}/{items.length}
          </span>
        </div>

        <table className="w-full border-collapse text-[13px]">
          <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <SortableHeader label="Topic / Technique" sortable="name" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
            <SortableHeader label="Status" sortable="status" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
            <SortableHeader label="Progress" sortable="progress" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
            <SortableHeader label="Confidence" sortable="confidence" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
            <SortableHeader label="Accuracy" sortable="accuracy" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
            <SortableHeader label="Questions" sortable="questions" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
            <th className="w-7 px-2.5 py-2" />
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {rows.map((item) => {
            const tier = getTier(item.accuracy);
            const hasData = tier !== null;
            const barClass = hasData ? tier.bar : "bg-slate-200 dark:bg-slate-700";
            const barWidth = hasData ? `${item.accuracy}%` : "0%";
            const clickable = item.general !== true;
            return (
                <tr
                    key={item.id}
                    onClick={() => clickable && onItemClick?.(item, childLevel)}
                    className={`${clickable ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40" : "cursor-default"} group transition-colors`}
                >
                  <td className="px-3.5 py-2 text-center">
                    <p className="font-medium text-[13px] text-slate-700 dark:text-slate-200">{item.name}</p>
                    <div className="mt-1 flex items-center justify-center gap-1.5 sm:hidden">
                      <StatusTag tier={tier} hasData={hasData} />
                      <div className="h-1 w-10 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full rounded-full ${barClass}`} style={{ width: barWidth }} />
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-3.5 py-2 text-center sm:table-cell">
                    <StatusTag tier={tier} hasData={hasData} />
                  </td>

                  <td className="hidden px-3.5 py-2 sm:table-cell">
                    <div className="mx-auto h-1 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full ${barClass}`} style={{ width: barWidth }} />
                    </div>
                  </td>

                  <td className="px-3.5 py-2 text-center">
                  <span className="text-[12px] font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                    {item.confidence == null ? "—" : `${item.confidence}%`}
                  </span>
                  </td>

                  <td className="px-3.5 py-2 text-center">
                  <span className="text-[12px] font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                    {item.accuracy == null ? "—" : `${item.accuracy}%`}
                  </span>
                  </td>

                  <td className="hidden px-3.5 py-2 text-center text-[12px] tabular-nums text-slate-400 dark:text-slate-500 sm:table-cell">
                    {item.questions}
                  </td>

                  <td className="px-2.5 py-2 text-center">
                    {!clickable ? (
                        null
                    ) : childLevel === null ? (
                        <ExternalLink size={12} className="text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
                    ) : (
                        <ChevronRight size={14} className="text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
                    )}
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>

        {rows.length === 0 && (
            <div className="px-3.5 py-8 text-center text-xs text-slate-400">
              No rows match your filters.
            </div>
        )}
      </div>
  );
}