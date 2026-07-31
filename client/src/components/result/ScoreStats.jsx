// File: components/result/ScoreStats.jsx
import { CheckCircle2, XCircle, MinusCircle, Target, Clock } from "lucide-react";

// Import the specific pieces you need from your new file
import { ScoreCard, formatTime } from "./ScoreCard";

export default function ScoreStats({ result }) {
    const wrong = result.results.filter((r) => r.yourAnswer != null && !r.correct).length;
    const skipped = result.results.filter((r) => r.yourAnswer == null).length;

    return (
        <div>
            <div className="mb-4">
                <h3 className="text-sm font-bold">Primary Stats</h3>
                <div className="flex gap-4">
                    <ScoreCard label="Correct" value={result.score} icon={CheckCircle2} />
                    <ScoreCard label="Accuracy" value={`${result.accuracy}%`} icon={Target} />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold">Secondary Stats</h3>
                <div className="flex gap-4">
                    <ScoreCard label="Wrong" value={wrong} icon={XCircle} color="text-rose-500" />
                    <ScoreCard label="Skipped" value={skipped} icon={MinusCircle} color="text-zinc-400" />
                    <ScoreCard label="Time" value={formatTime(result.timeTaken)} icon={Clock} />
                </div>
            </div>
        </div>
    );
}