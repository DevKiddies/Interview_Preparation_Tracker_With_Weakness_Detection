import { useNavigate } from "react-router-dom";

export default function BottomActions({ retakeUrl, retakeState }) {
  const navigate = useNavigate();

  return (
      <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-8 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
              onClick={() => navigate("/practice/mock-tests")}
              className="flex-1 rounded-xl border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white dark:focus-visible:ring-zinc-600 dark:focus-visible:ring-offset-zinc-950"
          >
            Back
          </button>
          <button
              onClick={() => navigate(retakeUrl, retakeState ? { state: retakeState } : undefined)}
              className="flex-1 rounded-xl bg-zinc-900 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-950"
          >
            Retake Test
          </button>
        </div>
      </div>
  );
}