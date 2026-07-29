import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Flag, XCircle, AlertTriangle, Timer } from "lucide-react";
import QuizHeader from "../components/mock-test/QuizHeader.jsx";
import QuizQuestionCard from "../components/mock-test/QuizQuestionCard.jsx";
import QuizSidebarNavigator from "../components/mock-test/QuizSidebarNavigator.jsx";
import QuizFooterControls from "../components/mock-test/QuizFooterControls.jsx";
import API_BASE from "../utils/api.js";

export default function MockTestPage() {
  const { testId } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const isTopicTest    = testId === "topic";
  const topicConfig    = isTopicTest ? (location.state || {}) : {};
  const category       = topicConfig.category ?? null;
  const questionLimit  = topicConfig.limit    ?? 20;
  const initialTime    = isTopicTest ? (topicConfig.duration ?? 1800) : 5400;
  const categoryLabel  = Array.isArray(category)
      ? (category.length === 1 ? category[0] : `${category.length} Topics`)
      : (category ?? "Data Structures & Algorithms"); // Fallback for UI display
  const testTitle      = isTopicTest
      ? `${categoryLabel} Practice`
      : `Mock Assessment #${testId}`;

  const retakeUrl   = isTopicTest ? "/practice/mock-tests/topic" : `/practice/mock-tests/${testId}`;
  const retakeState = isTopicTest ? { category, limit: questionLimit, duration: initialTime } : null;

  const CACHE_KEY = `quiz-${testId}`;

  const [sidebarOpen, setSidebarOpen]        = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timedOut, setTimedOut]              = useState(false);
  const [submitting, setSubmitting]          = useState(false);

  const [questions, setQuestions]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [currentIndex, setCurrentIndex]       = useState(0);
  const [selectedAnswers, setSelectedAnswers]  = useState({});
  const [statuses, setStatuses]               = useState([]);
  const [timeLeft, setTimeLeft]               = useState(initialTime);
  const [tabSwitches, setTabSwitches]         = useState(0);
  const [showTabWarning, setShowTabWarning]   = useState(false);

  const initialTimeRef = useRef(initialTime);
  const doSubmitRef = useRef(null);
  const stateRef = useRef({ questions, selectedAnswers, timeLeft });
  useEffect(() => {
    stateRef.current = { questions, selectedAnswers, timeLeft };
  }, [questions, selectedAnswers, timeLeft]);

  const saveToCache = (state) => {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch {}
  };

  useEffect(() => {
    // Topic tests: new navigation → clear stale cache so a fresh fetch happens
    if (isTopicTest && category) {
      sessionStorage.removeItem(CACHE_KEY);
    }

    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const state = JSON.parse(cached);
        setQuestions(state.questions);
        setSelectedAnswers(state.selectedAnswers);
        setStatuses(state.statuses);
        setCurrentIndex(state.currentIndex);
        setTimeLeft(state.timeLeft);
        setTabSwitches(state.tabSwitches ?? 0);
        initialTimeRef.current = state.initialTime;
        setLoading(false);
        return;
      } catch {}
    }

    const token = localStorage.getItem("token");
    const qs    = new URLSearchParams({ limit: questionLimit });

    if (category) {
      const cats = Array.isArray(category) ? category : [category];
      cats.forEach((c) => qs.append("category", c));
    }

    fetch(`${API_BASE}/api/questions?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
        .then((data) => {
          setQuestions(data);
          setLoading(false);
          saveToCache({ questions: data, selectedAnswers: {}, statuses: [], currentIndex: 0, timeLeft: initialTimeRef.current, tabSwitches: 0, initialTime: initialTimeRef.current });
        })
        .catch(() => { setFetchError("Failed to load questions. Please try again."); setLoading(false); });
  }, []);

  // Persist progress on every meaningful change
  useEffect(() => {
    if (questions.length === 0) return;
    saveToCache({ questions, selectedAnswers, statuses, currentIndex, timeLeft, tabSwitches, initialTime: initialTimeRef.current });
  }, [questions, selectedAnswers, statuses, currentIndex, timeLeft, tabSwitches]);

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
    const handler = () => {
      if (document.hidden) return;
      setTabSwitches((prev) => prev + 1);
      setShowTabWarning(true);
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  useEffect(() => {
    if (tabSwitches >= 3) doSubmitRef.current?.();
  }, [tabSwitches]);

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
          category: Array.isArray(category) ? category.join(", ") : (category ?? "Data Structures & Algorithms"),
          topic: null,
          tabSwitches,
          timeTaken: initialTimeRef.current - tl,
          questionIds,
          answers,
        }),
      });
      if (!res.ok) throw new Error();
      sessionStorage.removeItem(CACHE_KEY);
      const result = await res.json();
      navigate("/practice/results", { state: { result, testTitle, retakeUrl, retakeState } });
    } catch {
      navigate("/practice/mock-tests");
    }
  }, [submitting, navigate, category, initialTime, testTitle, retakeUrl, retakeState]);
  doSubmitRef.current = doSubmit;

  const currentQuestion  = questions[currentIndex];
  const isCurrentFlagged = statuses[currentIndex] === "flagged";
  const hasAnswer        = !!selectedAnswers[currentIndex];

  const handleSaveNext = () => {
    setStatuses((prev) => {
      const u = [...prev];
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

  const handleNavigate = (idx) => {
    setStatuses((prev) => {
      if (prev[currentIndex] === "flagged") return prev;
      const u = [...prev];
      u[currentIndex] = selectedAnswers[currentIndex] ? "answered" : "skipped";
      return u;
    });
    setCurrentIndex(idx);
  };

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
        {showTabWarning && (
            <TabSwitchBanner tabSwitches={tabSwitches} onDismiss={() => setShowTabWarning(false)} />
        )}
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
              onNavigate={handleNavigate}
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
                      onClick={() => {
                        setShowFinishModal(false);
                        if (answeredCount === questions.length) {
                          doSubmit();
                        } else {
                          setShowConfirmModal(true);
                        }
                      }}
                      className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-sm shadow-rose-500/20 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
        )}

        {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <AlertTriangle size={20} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Unanswered Questions</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {notAnsweredCount} question{notAnsweredCount !== 1 ? "s" : ""} not answered. Submit anyway?
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                      onClick={() => setShowConfirmModal(false)}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Review
                  </button>
                  <button
                      onClick={() => { setShowConfirmModal(false); doSubmit(); }}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    Submit Anyway
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

function TabSwitchBanner({ tabSwitches, onDismiss }) {
    useEffect(() => {
        const id = setTimeout(onDismiss, 4000);
        return () => clearTimeout(id);
    }, [onDismiss]);

    return (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 shadow-lg dark:border-amber-500/30 dark:bg-amber-500/10">
            <div className="flex items-center gap-3">
                <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Tab switch detected ({tabSwitches}). Please stay on the test page.
                </p>
                <button onClick={onDismiss} className="ml-2 text-sm font-semibold text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200">
                    Dismiss
                </button>
            </div>
        </div>
    );
}