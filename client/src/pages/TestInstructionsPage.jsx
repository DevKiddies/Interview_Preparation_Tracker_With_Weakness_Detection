import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, PlayCircle, FileText } from "lucide-react";

const RULES = [
  "The timer begins immediately upon start and cannot be paused.",
  "Do not reload or close the tab — your attempt will be lost.",
  "Each question contains exactly one correct choice.",
  "Move freely between questions using the question index.",
  "Flag questions to revisit them prior to final submission.",
  "You may submit at any time. Unanswered questions are scored as 0.",
];

const TIPS = [
  "Eliminate obviously incorrect choices to narrow your options.",
  "If stuck on a question for more than 90 seconds, flag it and move forward.",
  "Allocate the final 3 minutes to review flagged questions.",
];

export default function TestInstructionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  const st = location.state;

  if (!st?.nextUrl) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
          <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-7 text-center">
            <FileText size={18} className="mx-auto mb-3 text-zinc-300" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-zinc-900">No assessment selected</h2>
            <p className="mt-1.5 text-[13px] text-zinc-500 leading-relaxed">
              Select an assessment from the test library to view instructions.
            </p>
            <button
                onClick={() => navigate("/practice/mock-tests")}
                className="mt-6 w-full rounded-md bg-zinc-900 py-2.5 text-[13px] font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Back to test selection
            </button>
          </div>
        </div>
    );
  }

  const {
    nextUrl = "/practice/mock-tests/dsa",
    nextState = null,
    testTitle = "Mock Assessment",
    questions = 20,
    timeMins = 90,
    difficulty = "Mixed",
    description = "",
  } = st;

  const handleBegin = () =>
      navigate(nextUrl, nextState ? { state: nextState } : undefined);

  return (
      <div className="min-h-screen bg-zinc-50 py-10 text-zinc-900">
        <div className="mx-auto max-w-2xl px-4">
          {/* Back */}
          <button
              onClick={() => navigate(-1)}
              className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to tests
          </button>

          {/* Card */}
          <div className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
            {/* Header */}
            <div className="border-b border-zinc-200 px-7 py-6">
              <h1
                  className="text-2xl leading-snug text-zinc-900"
                  style={{ fontFamily: "'Source Serif 4', Georgia, 'Times New Roman', serif" }}
              >
                {testTitle}
              </h1>
              {description && (
                  <p className="mt-2 text-[13px] text-zinc-500 leading-relaxed">{description}</p>
              )}

              {/* Meta — plain text, no bordered card */}
              <div className="mt-5 flex items-center gap-6 text-[13px]">
                <div>
                  <span className="text-zinc-400">Questions&nbsp;</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">{questions}</span>
                </div>
                <div className="h-3 w-px bg-zinc-200" />
                <div>
                  <span className="text-zinc-400">Duration&nbsp;</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">{timeMins}m</span>
                </div>
                <div className="h-3 w-px bg-zinc-200" />
                <div>
                  <span className="text-zinc-400">Level&nbsp;</span>
                  <span className="font-semibold text-zinc-900">{difficulty}</span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Examination rules
              </h2>
              <ol className="mb-7 space-y-2.5">
                {RULES.map((rule, i) => (
                    <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-zinc-600">
                      <span className="shrink-0 text-zinc-300 tabular-nums">{i + 1}.</span>
                      {rule}
                    </li>
                ))}
              </ol>

              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Strategy
              </h2>
              <ul className="space-y-2">
                {TIPS.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-zinc-600">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                      {tip}
                    </li>
                ))}
              </ul>
            </div>

            {/* Footer actions */}
            <div className="border-t border-zinc-200 px-7 py-6 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                />
                <span className="text-[13px] text-zinc-600 leading-snug">
                I have read and agree to follow all examination rules.
              </span>
              </label>

              <button
                  onClick={handleBegin}
                  disabled={!agreed}
                  className={`flex w-full items-center justify-center gap-2 rounded-md py-3 text-[13px] font-medium transition-colors ${
                      agreed
                          ? "bg-zinc-900 text-white hover:bg-zinc-800"
                          : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  }`}
              >
                <PlayCircle size={15} />
                Begin assessment
              </button>

              <button
                  onClick={() => navigate(-1)}
                  className="w-full rounded-md border border-zinc-200 bg-white py-2.5 text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-zinc-400">
            Submissions are final and cannot be modified.
          </p>
        </div>
      </div>
  );
}