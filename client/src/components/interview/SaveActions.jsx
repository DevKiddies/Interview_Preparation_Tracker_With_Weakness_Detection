import { useNavigate } from "react-router-dom";

function SaveActions({ onSave, saving }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm shadow-indigo-200 dark:shadow-indigo-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {saving ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Saving…
          </span>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}

export default SaveActions;
