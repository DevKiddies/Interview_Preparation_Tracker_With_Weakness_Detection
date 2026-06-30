// MockTestPage.jsx — full-screen timed quiz page.
// Handles two test modes: regular mock tests (identified by a numeric testId)
// and topic-specific tests (testId === "topic", config passed via router state).
// Manages question fetching, a countdown timer, per-question answer state,
// flagging/skipping, and final submission to the backend.

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Flag, XCircle, AlertTriangle, Timer } from "lucide-react";
import QuizHeader from "../components/ui/QuizHeader";
import QuizQuestionCard from "../components/ui/QuizQuestionCard";
import QuizSidebarNavigator from "../components/ui/QuizSidebarNavigator";
import QuizFooterControls from "../components/ui/QuizFooterControls";
import API_BASE from "../utils/api.js";

export default function MockTestPage() {
  const { testId } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Topic tests arrive with config in router state (category, limit, duration).
  // Regular mock tests use hardcoded defaults (20 questions, 90-minute timer).
  const isTopicTest    = testId === "topic";
  const topicConfig    = isTopicTest ? (location.state || {}) : {};
  const category       = topicConfig.category ?? null; // string | string[] | null
  const questionLimit  = topicConfig.limit    ?? 20;
  const initialTime    = isTopicTest ? (topicConfig.duration ?? 1800) : 5400;
  const categoryLabel  = Array.isArray(category)
    ? (category.length === 1 ? category[0] : `${category.length} Topics`)
    : (category ?? "Topic");
  const testTitle      = isTopicTest
    ? `${categoryLabel} Practice`
    : `DSA Assessment #${testId}`;

  const retakeUrl   = isTopicTest ? "/practice/mock-tests/topic" : `/practice/mock-tests/${testId}`;
  const retakeState = isTopicTest ? { category, limit: questionLimit, duration: initialTime } : null;

  const [sidebarOpen, setSidebarOpen]        = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [timedOut, setTimedOut]              = useState(false);
  const [submitting, setSubmitting]          = useState(false);

  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [currentIndex, setCurrentIndex]       = useState(0);
  const [selectedAnswers, setSelectedAnswers]  = useState({});
  const [statuses, setStatuses]               = useState([]);
  const [timeLeft, setTimeLeft]               = useState(initialTime);

  // doSubmit is wrapped in useCallback, so it captures a stale closure over state values.
  // A ref that mirrors current state lets doSubmit always read the latest snapshot without
  // being listed as a dependency (which would recreate the callback on every keystroke).
  const stateRef = useRef({ questions, selectedAnswers, timeLeft });
  useEffect(() => {
    stateRef.current = { questions, selectedAnswers, timeLeft };
  }, [questions, selectedAnswers, timeLeft]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const qs    = new URLSearchParams({ limit: questionLimit });
    if (category) {
      const cats = Array.isArray(category) ? category : [category];
      cats.forEach((c) => qs.append("category", c));
    } else {
      qs.set("topic", "DSA");
    }

    fetch(`${API_BASE}/api/questions?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => { setQuestions(data); setLoading(false); })
      .catch(() => { setFetchError("Failed to load questions. Please try again."); setLoading(false); });
  }, [testId, category, questionLimit]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && questions.length > 0) {
      setTimedOut(true);
      setShowFinishModal(true);
    }
  }, [timeLeft, questions.length]);

  const doSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const { questions: qs, selectedAnswers: sa, timeLeft: tl } = stateRef.current;
    const token       = localStorage.getItem("token");
    const questionIds = qs.map((q) => q.id);
    const answers     = {};
    qs.forEach((q, idx) => { if (sa[idx]) answers[q.id] = sa[idx]; });

    try {
      const res = await fetch(`${API_BASE}/api/tests/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topic: Array.isArray(category) ? category.join(", ") : (category ?? "DSA"),
          timeTaken: initialTime - tl,
          questionIds,
          answers,
        }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      navigate("/practice/results", { state: { result, testTitle, retakeUrl, retakeState } });
    } catch {
      navigate("/practice/mock-tests");
    }
  }, [submitting, navigate, category, initialTime, testTitle, retakeUrl, retakeState]);

  const currentQuestion  = questions[currentIndex];
  const isCurrentFlagged = statuses[currentIndex] === "flagged";
  const hasAnswer        = !!selectedAnswers[currentIndex];

  const handleSaveNext = () => {
    setStatuses((prev) => {
      const u = [...prev];
      // Mark as answered if an option was selected, skipped if not —
      // but don't overwrite a flagged status with skipped.
      u[currentIndex] = selectedAnswers[currentIndex]
        ? "answered"
        : u[currentIndex] !== "flagged"
        ? "skipped"
        : "flagged";
      return u;
    });
    if (currentIndex < questions.length - 1) setCurrentIndex((p) => p + 1);
  };

  const handleFlag = () =>
    setStatuses((prev) => {
      const u = [...prev];
      u[currentIndex] = u[currentIndex] === "flagged" ? "unvisited" : "flagged";
      return u;
    });

  const handleClear = () =>
    setSelectedAnswers((prev) => { const u = { ...prev }; delete u[currentIndex]; return u; });

  const answeredCount    = statuses.filter((s) => s === "answered").length;
  const flaggedCount     = statuses.filter((s) => s === "flagged").length;
  const notAnsweredCount = questions.length - answeredCount;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading questions…</p>
    </div>
  );

  if (submitting) return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white dark:bg-slate-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submitting your test…</p>
    </div>
  );

  if (fetchError) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
      <p className="text-sm text-rose-500">{fetchError}</p>
      <button onClick={() => navigate("/practice/mock-tests")}
        className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
        Back to Tests
      </button>
    </div>
  );

  if (questions.length === 0) return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No questions available for "{categoryLabel ?? testId}" yet.
      </p>
      <button onClick={() => navigate("/practice/mock-tests")}
        className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
        Back to Tests
      </button>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-200">
      <QuizHeader
        timeLeft={timeLeft}
        total={questions.length}
        statuses={statuses}
        title={testTitle}
        subtitle={isTopicTest ? "Topic Practice" : "Software Engineer I"}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
        onFinish={() => setShowFinishModal(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-7">
          <QuizQuestionCard
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            selectedOption={selectedAnswers[currentIndex]}
            onSelect={(opt) => setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: opt }))}
          />
          <QuizFooterControls
            onPrev={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            onFlag={handleFlag}
            onSaveNext={handleSaveNext}
            onClear={handleClear}
            isFirst={currentIndex === 0}
            isLast={currentIndex === questions.length - 1}
            isFlagged={isCurrentFlagged}
            hasAnswer={hasAnswer}
          />
        </div>

        <QuizSidebarNavigator
          total={questions.length}
          currentIndex={currentIndex}
          statuses={statuses}
          onNavigate={(idx) => setCurrentIndex(idx)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${timedOut ? "bg-amber-100 dark:bg-amber-500/10" : "bg-rose-100 dark:bg-rose-500/10"}`}>
                {timedOut
                  ? <Timer size={20} className="text-amber-600 dark:text-amber-400" />
                  : <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />
                }
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {timedOut ? "Time's Up!" : "Submit Assessment?"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {timedOut
                    ? "Your time has expired. Answers will be submitted."
                    : "This action cannot be undone."
                  }
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
              <div className="text-center">
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{answeredCount}</p>
                <p className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <CheckCircle2 size={10} /> Answered
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{flaggedCount}</p>
                <p className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <Flag size={10} /> Flagged
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{notAnsweredCount}</p>
                <p className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  <XCircle size={10} /> Unanswered
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {!timedOut && (
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Continue
                </button>
              )}
              <button
                onClick={() => { setShowFinishModal(false); doSubmit(); }}
                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-500/20 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
