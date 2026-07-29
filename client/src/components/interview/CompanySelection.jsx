const COMPANIES = [
  { id: "faang", label: "FAANG" },
  { id: "product", label: "Product" },
  { id: "service", label: "Service" },
  { id: "competitive", label: "Competitive Exams" },
];

function CompanySelection({ value, onChange }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
        Choose Target
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {COMPANIES.map((c) => {
          const isSelected = value === c.id;
          return (
            <div
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`px-4 py-3 rounded-lg cursor-pointer transition-all border text-sm font-medium ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {c.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompanySelection;
