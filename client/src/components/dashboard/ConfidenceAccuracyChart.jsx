import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "../ui/DashboardCard";

const RANGES = ["7W", "30D"];

function RangeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            value === range
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-2 flex items-center gap-6">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="h-1 w-4 rounded-full bg-indigo-600" />
        Accuracy %
      </span>
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        <span className="h-1 w-4 rounded-full bg-teal-400" />
        Confidence
      </span>
    </div>
  );
}

export default function ConfidenceAccuracyChart({ dataByRange }) {
  const [range, setRange] = useState("7W");
  const data = dataByRange[range] ?? [];

  return (
    <DashboardCard
      title="Confidence vs Accuracy"
      subtitle="Weekly performance trend"
      action={<RangeToggle value={range} onChange={setRange} />}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              name="Accuracy %"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#4f46e5" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="confidence"
              name="Confidence"
              stroke="#2dd4bf"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#2dd4bf" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Legend />
    </DashboardCard>
  );
}
