const LEVELS = [
  { id: "fresher", label: "Student / Fresher" },
  { id: "mid", label: "Mid-Level" },
  { id: "senior", label: "Senior" },
];

function ExperienceSelection({ value, onChange }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
        Experience
      </h2>
      <div className="flex flex-col gap-2">
        {LEVELS.map((level) => {
          const isSelected = value === level.id;
          return (
            <div
              key={level.id}
              onClick={() => onChange(level.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all border ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSelected ? "border-white" : "border-slate-300 dark:border-slate-600"
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                {level.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExperienceSelection;
