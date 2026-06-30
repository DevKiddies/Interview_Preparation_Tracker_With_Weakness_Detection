import { Hammer } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl opacity-60 animate-pulse" />
        <div className="relative bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-5 rounded-3xl text-blue-600 dark:text-blue-400 inline-block shadow-sm">
          <Hammer size={36} className="animate-[bounce_2s_infinite] origin-bottom-right" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
        {title}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm text-base mb-8 leading-relaxed">
        This section is under development. Your team will implement it here.
      </p>

      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
