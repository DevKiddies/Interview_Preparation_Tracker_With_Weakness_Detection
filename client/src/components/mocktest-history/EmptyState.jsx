import { useNavigate } from "react-router-dom";

function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="text-4xl mb-4">📄</div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
        No mock tests completed.
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
        Start your first mock test to begin tracking your preparation.
      </p>
      <button
        onClick={() => navigate("/practice/mock-tests")}
        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.97] shadow-sm shadow-indigo-200 dark:shadow-indigo-900 transition-all"
      >
        Take Mock Test
      </button>
    </div>
  );
}

export default EmptyState;
