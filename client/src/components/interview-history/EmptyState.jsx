import { CalendarX2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EmptyState() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 p-10 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <CalendarX2 size={24} />
            </div>
            <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                No interview history yet
            </h2>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                Complete your first interview preparation track to automatically record your history and analytics here.
            </p>
            <button
                onClick={() => navigate("/interview-settings")}
                className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
                Set Up Interview Goal
            </button>
        </div>
    );
}

export default EmptyState;