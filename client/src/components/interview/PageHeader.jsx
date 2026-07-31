import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function PageHeader() {
    return (
        <div className="flex items-center justify-between gap-6 py-2">
            <div className="space-y-0.5">
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    Interview Settings
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update your current interview goal and timeline.
                </p>
            </div>

            <Link
                to="/dashboard"
                className="flex h-8 px-3 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <ArrowLeft size={14} className="text-slate-400" />
                <span>Back</span>
            </Link>
        </div>
    );
}

export default PageHeader;
