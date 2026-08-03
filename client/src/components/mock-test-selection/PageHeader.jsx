import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function PageHeader() {
    return (
        <div className="flex items-center justify-between gap-6 py-2">
            <div className="space-y-0.5">
                <h1 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                    Mock Tests
                </h1>
                <p className="text-[10px] font-black uppercase tracking-normal text-slate-500 dark:text-slate-400 opacity-80">
                    Practice tests tailored for your interview preparation.
                </p>
            </div>
        </div>
    );
}

export default PageHeader;