import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PageHeader() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between gap-6 py-2">
            <div className="space-y-0.5">
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    Interview History
                </h1>
                <p className="text-[10px] font-black uppercase tracking-normal text-slate-500 dark:text-slate-400 opacity-80">
                    All completed preparation history.
                </p>
            </div>

            <button
                onClick={() => navigate("/interview-settings")}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-[0.98]"
            >
                <Settings size={14} />
                Interview Settings
            </button>

        </div>
    );
}

export default PageHeader;