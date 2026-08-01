import MockTestCard from "./MockTestCard";

function MockTestTimeline({ tests, onViewAnalysis }) {
  if (!tests || tests.length === 0) return null;

  return (
      <div className="relative">
        {/* Continuous Timeline Line — Centered exactly at 7px (middle of the 14px dot) */}
        <div className="absolute left-1.75 top-6 bottom-6 w-0.5 -translate-x-1/2 bg-slate-200 dark:bg-slate-700" />

        <div className="space-y-4">
          {tests.map((test) => (
              <div key={test.id} className="relative flex items-start gap-4">
                {/* Timeline Node Container */}
                <div className="relative z-10 mt-5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  <div
                      className={`h-3.5 w-3.5 rounded-full border-2 shadow-xs ring-4 ring-indigo-50 dark:ring-slate-950 ${
                          test.status === "COMPLETED"
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"
                      }`}
                  />
                </div>

                {/* Card Content */}
                <div className="min-w-0 flex-1">
                  <MockTestCard test={test} onViewAnalysis={onViewAnalysis} />
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}

export default MockTestTimeline;
