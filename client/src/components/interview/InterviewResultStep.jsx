import { CheckCircle2, XCircle, Archive, Trash2, Check } from "lucide-react";

const OPTIONS = [
    {
        id: "SELECTED",
        label: "Selected",
        desc: "You got the offer",
        icon: CheckCircle2,
        accent: {
            icon: "text-emerald-500 dark:text-emerald-400",
            card: "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-500/10",
        },
    },
    {
        id: "NOT_SELECTED",
        label: "Not Selected",
        desc: "Didn't make it",
        icon: XCircle,
        accent: {
            icon: "text-rose-500 dark:text-rose-400",
            card: "border-rose-500 bg-rose-50/60 dark:bg-rose-500/10",
        },
    },
    {
        id: "ARCHIVED",
        label: "Archive",
        desc: "Save for later",
        icon: Archive,
        accent: {
            icon: "text-amber-500 dark:text-amber-400",
            card: "border-amber-500 bg-amber-50/60 dark:bg-amber-500/10",
        },
    },
    {
        id: "DELETED",
        label: "Delete",
        desc: "Remove interview",
        icon: Trash2,
        accent: {
            icon: "text-red-500 dark:text-red-400",
            card: "border-red-500 bg-red-50/60 dark:bg-red-500/10",
        },
    },
];

function InterviewResultStep({ value, onChange }) {
    return (
        <div>
            <h2 className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                How did your interview go?
            </h2>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                Mark the outcome for this completed interview.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {OPTIONS.map((opt) => {
                    const selected = value === opt.id;
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => onChange(opt.id)}
                            className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                                selected
                                    ? opt.accent.card
                                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                            }`}
                        >
                            {selected && (
                                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                                    <Check size={12} strokeWidth={3} />
                                </span>
                            )}
                            <Icon
                                size={26}
                                strokeWidth={2}
                                className={selected ? opt.accent.icon : "text-slate-400"}
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {opt.label}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {opt.desc}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default InterviewResultStep;
