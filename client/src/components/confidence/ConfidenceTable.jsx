import { ChevronRight, ExternalLink } from "lucide-react";

const TIERS = [
  { min: 0, max: 40, bar: "bg-rose-500", dot: "bg-rose-500", badge: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400", label: "Needs attention" },
  { min: 40, max: 60, bar: "bg-amber-500", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", label: "Needs practice" },
  { min: 60, max: 80, bar: "bg-yellow-500", dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400", label: "Getting there" },
  { min: 80, max: 101, bar: "bg-emerald-500", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", label: "Strong" },
];

const NO_DATA_BADGE = "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500";

function getTier(confidence) {
  if (confidence == null) return null;
  return TIERS.find((t) => confidence >= t.min && confidence < t.max) || TIERS[TIERS.length - 1];
}

export default function ConfidenceTable({ items, childLevel, onItemClick }) {
  if (!items || items.length === 0) return null;

  return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full border-collapse text-[13px]">
          <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="px-3.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Topic / Technique
            </th>
            <th className="hidden px-3.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:table-cell">
              Status
            </th>
            <th className="hidden px-3.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:table-cell">
              Progress
            </th>
            <th className="px-3.5 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Confidence
            </th>
            <th className="hidden px-3.5 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:table-cell">
              Questions
            </th>
            <th className="w-7 px-2.5 py-2" />
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {items.map((item) => {
            const tier = getTier(item.confidence);
            const hasData = tier !== null;
            const badgeClass = hasData ? tier.badge : NO_DATA_BADGE;
            const barClass = hasData ? tier.bar : "bg-slate-200 dark:bg-slate-700";
            const barWidth = hasData ? `${item.confidence}%` : "0%";
            const label = hasData ? tier.label : "No data";
            return (
                <tr
                    key={item.id}
                    onClick={() => onItemClick?.(item, childLevel)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-3.5 py-2">
                    <p className="font-medium text-[13px] text-slate-700 dark:text-slate-200">{item.name}</p>
                    <div className="mt-1 flex items-center gap-1.5 sm:hidden">
                    <span className={`inline-block rounded px-1 py-0 text-[10px] font-medium ${badgeClass}`}>
                      {label}
                    </span>
                      <div className="h-1 w-10 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full rounded-full ${barClass}`} style={{ width: barWidth }} />
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-3.5 py-2 sm:table-cell">
                  <span className={`inline-block rounded px-1 py-0 text-[11px] font-medium ${badgeClass}`}>
                    {label}
                  </span>
                  </td>

                  <td className="hidden px-3.5 py-2 sm:table-cell">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className={`h-full rounded-full ${barClass}`} style={{ width: barWidth }} />
                    </div>
                  </td>

                  <td className="px-3.5 py-2 text-right">
                  <span className="text-[12px] font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                    {hasData ? `${item.confidence}%` : "—"}
                  </span>
                  </td>

                  <td className="hidden px-3.5 py-2 text-right text-[12px] tabular-nums text-slate-400 dark:text-slate-500 sm:table-cell">
                    {item.questions}
                  </td>

                  <td className="px-2.5 py-2 text-right">
                    {childLevel === null ? (
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
      </div>
  );
}