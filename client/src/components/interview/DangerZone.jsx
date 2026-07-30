import { useState } from "react";

function DangerZone({ onDelete, loading }) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onDelete();
    setConfirming(false);
  };

  return (
    <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-5">
      <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
        Danger Zone
      </h3>
      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
        Delete Current Interview
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
        This removes your current interview target (company, experience level, and date).
        Your quiz history and analytics remain untouched.
      </p>
      <button
        onClick={handleDelete}
        disabled={loading}
        className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
          confirming
            ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
            : "border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? "Deleting…" : confirming ? "Click again to confirm" : "Delete Interview"}
      </button>
    </div>
  );
}

export default DangerZone;
