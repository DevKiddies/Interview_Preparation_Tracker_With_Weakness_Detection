// WorkInProgress.jsx — placeholder page for features that are still being built.
// Also used as the catch-all 404 route so unknown paths land here instead of crashing.

import { Hammer, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function WorkInProgress() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center bg-linear-to-b from-white to-slate-50/50 dark:from-slate-950 dark:to-slate-900/50 transition-colors duration-200">

            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-xl opacity-60 animate-pulse" />
                <div className="relative bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-5 rounded-3xl text-blue-600 dark:text-blue-400 inline-block shadow-sm">
                    <Hammer size={40} className="animate-[bounce_2s_infinite] origin-bottom-right" />
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                Crafting Something Great
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-base md:text-lg mb-8 font-medium leading-relaxed">
                We're currently sharpening this feature to give you the ultimate edge. Check back shortly!
            </p>

            <Link
                to="/"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-sm"
            >
                <ArrowLeft size={16} />
                Back to Safety
            </Link>

        </div>
    );
}
