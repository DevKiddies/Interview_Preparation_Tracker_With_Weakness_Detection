// File: components/result/ScoreCard.jsx
import { CheckCircle2, XCircle, MinusCircle, Target, Clock } from "lucide-react";

// Export the time formatter so other files can use it if needed
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// Export the individual card component
export function ScoreCard({
                              label,
                              value,
                              icon: Icon,
                              color = "text-zinc-900 dark:text-white",
                              bg = "bg-zinc-50 dark:bg-zinc-800"
                          }) {
    return (
        <div className={`rounded-xl ${bg} p-3 text-center`}>
            <p className={`text-lg font-extrabold ${color}`}>{value}</p>
            <p className="flex items-center justify-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                <Icon size={10} /> {label}
            </p>
        </div>
    );
}