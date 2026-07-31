import React from "react";

function getConfidenceColor(confidence) {
  if (confidence >= 80) return { stroke: "#10b981", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  if (confidence >= 60) return { stroke: "#eab308", badge: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" };
  if (confidence >= 40) return { stroke: "#f59e0b", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
  return { stroke: "#f43f5e", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" };
}

export default function ConfidenceSummary({ title, confidence, childrenCount, childrenLabel, questions }) {
  const normalizedConfidence = Math.max(0, Math.min(100, confidence || 0));
  const { stroke, badge } = getConfidenceColor(normalizedConfidence);

  // SVG Circular Progress Constants
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedConfidence / 100) * circumference;

  return (
      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3.5">
          {/* Compact Dynamic Progress Ring */}
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 48 48">
              {/* Background Ring */}
              <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="3.5"
                  fill="transparent"
              />
              {/* Active Progress Ring */}
              <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke={stroke}
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute font-mono text-[11px] font-bold text-slate-800 dark:text-slate-100">
            {normalizedConfidence}%
          </span>
          </div>

          {/* Content Section */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </h2>
              <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${badge}`}>
              {normalizedConfidence}% Score
            </span>
            </div>

            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              {childrenCount} {childrenLabel}
            </span>
              {questions != null && (
                  <>
                    <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span>{questions} Questions</span>
                  </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}