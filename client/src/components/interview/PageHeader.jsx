import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function PageHeader() {
  return (
    <div className="flex items-start gap-4">
      <Link
        to="/dashboard"
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ArrowLeft size={16} />
      </Link>
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
          Interview Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Update your current interview goal and timeline.
        </p>
      </div>
    </div>
  );
}

export default PageHeader;
