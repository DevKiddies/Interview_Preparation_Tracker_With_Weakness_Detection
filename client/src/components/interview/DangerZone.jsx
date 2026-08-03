import { useState } from "react";
import { Archive } from "lucide-react";

function DangerZone({ onDelete, loading, onArchive, archiving }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onDelete();
    setConfirming(false);
  };

  const handleArchive = () => {
    if (!confirmingArchive) {
      setConfirmingArchive(true);
      return;
    }
    onArchive();
    setConfirmingArchive(false);
  };

  return (
    <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-5">
      <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
        Danger Zone
      </h3>

      {/* Archive Current Interview */}
      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
        Archive Current Interview
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
        Archives your current interview goal and clears the active status, so you can set a new goal.
        Your interview appears in history as archived.
      </p>
      <button
        onClick={handleArchive}
        disabled={archiving}
        className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg border transition-all ${
          confirmingArchive
            ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
            : "border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Archive size={14} />
        {archiving ? "Archiving…" : confirmingArchive ? "Click again to confirm" : "Archive Interview"}
      </button>

      <hr className="my-5 border-rose-200 dark:border-rose-900/50" />

      {/* Delete Current Interview */}
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
