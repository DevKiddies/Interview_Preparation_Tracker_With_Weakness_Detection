import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Flag,
  XCircle,
  AlertTriangle,
  Timer,
} from "lucide-react";
import QuizHeader from "../components/mock-test/QuizHeader.jsx";
import QuizQuestionCard from "../components/mock-test/QuizQuestionCard.jsx";
import QuizSidebarNavigator from "../components/mock-test/QuizSidebarNavigator.jsx";
import QuizFooterControls from "../components/mock-test/QuizFooterControls.jsx";
import API_BASE from "../utils/api.js";

export default function MockTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isTopicTest = testId === "topic";
  const topicConfig = isTopicTest ? location.state || {} : {};
  // Two distinct filters, kept separate on purpose: topicNames are specific
  // topic names (e.g. ["SQL"]) matched via /api/questions?topic=..., while
  // categoryName is a whole-category fallback (e.g. "Databases") matched via
  // ?category=... — these hit different lookups server-side (findByTopicName
  // vs findByCategoryName), so sending a topic name through the category
  // param silently returns zero questions.
  const topicNames = topicConfig.topics ?? null;
  const categoryName = topicConfig.category ?? null;
  const filterList = topicNames ?? (categoryName ? [categoryName] : null);
  const questionLimit = topicConfig.limit ?? 20;
  const initialTime = isTopicTest ? (topicConfig.duration ?? 1800) : 5400;
  const categoryLabel = Array.isArray(filterList)
    ? filterList.length === 1
      ? filterList[0]
      : `${filterList.length} Topics`
    : (filterList ?? "Data Structures & Algorithms"); // Fallback for UI display
  const testTitle = isTopicTest
    ? `${categoryLabel} Practice`
    : `Mock Assessment #${testId}`;

  const retakeUrl = isTopicTest
    ? "/practice/mock-tests/topic"
    : `/practice/mock-tests/${testId}`;
  const retakeState = isTopicTest
    ? {
        topics: topicNames,
        category: categoryName,
        limit: questionLimit,
        duration: initialTime,
      }
    : null;

  const CACHE_KEY = `quiz-${testId}`;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  // selectedAnswers is the single source of truth for "answered": selecting an
  // option immediately answers the question (no Next click required). flagged
  // is fully independent — a question can be answered AND flagged at once.
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  // Confidence/behavioral tracking: how many times the user changed each
  // answer (switchCounts), and seconds spent on each question (questionTime).
  // Both are keyed by question index and sent with the submission payload.
  const [switches, setSwitches] = useState({});
  const [questionTimes, setQuestionTimes] = useState({});
  // Added state to track the session ID for the test. Currently, this is not being used in the frontend, but it can be useful for future enhancements or debugging.
  // const [sessionId, setSessionId] = useState(null);

  const initialTimeRef = useRef(initialTime);
  const doSubmitRef = useRef(null);
  const fetchedRef = useRef(false);
  const stateRef = useRef({
    questions,
    selectedAnswers,
    flagged,
    timeLeft,
    switches,
    questionTimes,
  });
  useEffect(() => {
    stateRef.current = {
      questions,
      selectedAnswers,
      flagged,
      timeLeft,
      switches,
      questionTimes,
    };
  }, [questions, selectedAnswers, flagged, timeLeft, switches, questionTimes]);

  // Per-question elapsed time: ticks every second for whichever question is
  // currently visible (mirrors the overall timer's second-granularity).
  useEffect(() => {
    if (questions.length === 0) return;
    const id = setInterval(() => {
      setQuestionTimes((prev) => ({
        ...prev,
        [currentIndex]: (prev[currentIndex] || 0) + 1,
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [questions.length, currentIndex]);

  const saveToCache = (state) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(state));
    } catch {}
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Topic tests: new navigation → clear stale cache so a fresh fetch happens
    if (isTopicTest && (topicNames || categoryName)) {
      sessionStorage.removeItem(CACHE_KEY);
    }

    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const state = JSON.parse(cached);
        setQuestions(state.questions);
        setSelectedAnswers(state.selectedAnswers ?? {});
        // Migrate legacy caches that stored a single "statuses" array where
        // answered/flagged/skipped were mutually exclusive: rebuild the
        // independent flagged map from any "flagged" statuses.
        if (state.flagged) {
          setFlagged(state.flagged);
        } else if (Array.isArray(state.statuses)) {
          const f = {};
          state.statuses.forEach((s, idx) => {
            if (s === "flagged") f[idx] = true;
          });
          setFlagged(f);
        }
        setCurrentIndex(state.currentIndex ?? 0);
        setTimeLeft(state.timeLeft);
        setTabSwitches(state.tabSwitches ?? 0);
        setSwitches(state.switches ?? {});
        setQuestionTimes(state.questionTimes ?? {});
        initialTimeRef.current = state.initialTime;
        setLoading(false);
        return;
      } catch {}
    }

    const token = localStorage.getItem("token");
    const qs = new URLSearchParams({ limit: questionLimit });

    if (topicNames && topicNames.length) {
      topicNames.forEach((t) => qs.append("topic", t));
    } else if (categoryName) {
      qs.append("category", categoryName);
    }

    fetch(`${API_BASE}/api/questions?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setQuestions(data);
        setLoading(false);
        saveToCache({
          questions: data,
          selectedAnswers: {},
          flagged: {},
          currentIndex: 0,
          timeLeft: initialTimeRef.current,
          tabSwitches: 0,
          switches: {},
          questionTimes: {},
          initialTime: initialTimeRef.current,
        });
      })
      // .then(async (data) => {
      //   setQuestions(data);
      //   setLoading(false);

      //   // Start a test session on the backend
      //   const sessionRes = await fetch(
      //     `${API_BASE}/api/tests/start/${testId}`,
      //     {
      //       method: "POST",
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //       },
      //     }
      //   );

      //   const newSessionId = await sessionRes.json();

      //   setSessionId(newSessionId);

      //   saveToCache({
      //     questions: data,
      //     selectedAnswers: {},
      //     statuses: [],
      //     currentIndex: 0,
      //     timeLeft: initialTimeRef.current,
      //     tabSwitches: 0,
      //     initialTime: initialTimeRef.current,
      //     sessionId: newSessionId,
      //   });
      // })
      .catch(() => {
        setFetchError("Failed to load questions. Please try again.");
        setLoading(false);
      });
  }, []);

  // Persist progress on every meaningful change
  useEffect(() => {
    if (questions.length === 0) return;
    saveToCache({
      questions,
      selectedAnswers,
      flagged,
      currentIndex,
      timeLeft,
      tabSwitches,
      switches,
      questionTimes,
      initialTime: initialTimeRef.current,
    });
  }, [
    questions,
    selectedAnswers,
    flagged,
    currentIndex,
    timeLeft,
    tabSwitches,
    switches,
    questionTimes,
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
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

    const {
      questions: qs,
      selectedAnswers: sa,
      flagged: fl,
      timeLeft: tl,
      switches: sw,
      questionTimes: qt,
    } = stateRef.current;
    const token = localStorage.getItem("token");
    const questionIds = qs.map((q) => q.id);
    const answers = {};
    // Behavioral data per question, keyed by questionId for the backend:
    //   switchCounts = how many times the user changed their selection
    //   flaggedIds   = questions the user marked for review
    //   questionTime = seconds spent on that question
    const switchCounts = {};
    const flaggedIds = [];
    const questionTime = {};
    qs.forEach((q, idx) => {
      if (sa[idx]) answers[q.id] = sa[idx];
      if (fl[idx]) flaggedIds.push(q.id);
      if (sw[idx] > 0) switchCounts[q.id] = sw[idx];
      if (qt[idx] > 0) questionTime[q.id] = qt[idx];
    });

    try {
      const res = await fetch(`${API_BASE}/api/tests/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: Array.isArray(filterList)
            ? filterList.join(", ")
            : (filterList ?? "Data Structures & Algorithms"),
          topic: null,
          type: isTopicTest ? "TOPIC" : "MOCK",
          tabSwitches,
          timeTaken: initialTimeRef.current - tl,
          questionIds,
          answers,
          switchCounts,
          flaggedIds,
          questionTime,
        }),
      });
      if (!res.ok) throw new Error();
      sessionStorage.removeItem(CACHE_KEY);
      const result = await res.json();
      navigate("/practice/results", {
        state: { result, testTitle, retakeUrl, retakeState },
      });
    } catch {
      navigate("/practice/mock-tests");
    }
  }, [
    submitting,
    navigate,
    filterList,
    initialTime,
    testTitle,
    retakeUrl,
    retakeState,
  ]);
  doSubmitRef.current = doSubmit;

  const currentQuestion = questions[currentIndex];
  const isCurrentFlagged = !!flagged[currentIndex];
  const hasAnswer = !!selectedAnswers[currentIndex];

  // Select marks the question answered immediately — no Next click needed.
  const handleSelectOption = (opt) => {
    setSelectedAnswers((prev) => {
      const previous = prev[currentIndex];
      if (previous && previous !== opt) {
        setSwitches((s) => ({
          ...s,
          [currentIndex]: (s[currentIndex] || 0) + 1,
        }));
      }
      return { ...prev, [currentIndex]: opt };
    });
  };

  // Next only navigates. It never recalculates answered/flagged state —
  // those are derived purely from selectedAnswers / flagged.
  const handleSaveNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setShowFinishModal(true);
    }
  };

  // Flagging is independent of the answer. Toggling the flag never touches
  // selectedAnswers, so the answered count is unaffected.
  const handleFlag = () =>
    setFlagged((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));

  // Navigation only moves the pointer; the current question keeps whatever
  // answered/flagged state it already has.
  const handleNavigate = (idx) => setCurrentIndex(idx);

  // Clearing the selection is the ONLY way the answered count decreases.
  const handleClear = () =>
    setSelectedAnswers((prev) => {
      const u = { ...prev };
      delete u[currentIndex];
      return u;
    });

  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = Object.keys(flagged).filter((k) => flagged[k]).length;
  const notAnsweredCount = questions.length - answeredCount;

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading questions…
        </p>
      </div>
    );

  if (submitting)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-white dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Submitting your test…
        </p>
      </div>
    );

  if (fetchError)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
        <p className="text-sm text-rose-500">{fetchError}</p>
        <button
          onClick={() => navigate("/practice/mock-tests")}
          className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Back to Tests
        </button>
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No questions available for "{categoryLabel ?? testId}" yet.
        </p>
        <button
          onClick={() => navigate("/practice/mock-tests")}
          className="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Back to Tests
        </button>
      </div>
    );

  return (
    <div className="flex h-screen flex-col bg-white font-sans text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-200">
      {showTabWarning && (
        <TabSwitchBanner
          tabSwitches={tabSwitches}
          onDismiss={() => setShowTabWarning(false)}
        />
      )}
      <QuizHeader
        timeLeft={timeLeft}
        total={questions.length}
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
            onSelect={handleSelectOption}
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
          selectedAnswers={selectedAnswers}
          flagged={flagged}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-md border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                {timedOut ? (
                  <Timer
                    size={20}
                    className="text-zinc-500 dark:text-zinc-400"
                  />
                ) : (
                  <AlertTriangle
                    size={20}
                    className="text-zinc-500 dark:text-zinc-400"
                  />
                )}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">
                  {timedOut ? "Time's Up" : "Submit Assessment?"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {timedOut
                    ? "Your time has expired. Your answers will be submitted."
                    : "Review your progress before submitting."}
                </p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-3 gap-2 rounded-md bg-zinc-50 dark:bg-zinc-800 p-3">
              <div className="text-center">
                <p className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  {answeredCount}
                </p>
                <p className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2 size={10} /> Answered
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  {flaggedCount}
                </p>
                <p className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  <Flag size={10} /> Flagged
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  {notAnsweredCount}
                </p>
                <p className="flex items-center justify-center gap-0.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                  <XCircle size={10} /> Unanswered
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {!timedOut && (
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
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
                className="flex-1 rounded-md bg-zinc-900 hover:bg-zinc-800 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-md border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800">
                <AlertTriangle
                  size={20}
                  className="text-zinc-500 dark:text-zinc-400"
                />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white">
                  Submit anyway?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {notAnsweredCount} question{notAnsweredCount !== 1 ? "s" : ""}{" "}
                  not answered.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                Review
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  doSubmit();
                }}
                className="flex-1 rounded-md bg-zinc-900 hover:bg-zinc-800 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
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
        <AlertTriangle
          size={16}
          className="shrink-0 text-amber-600 dark:text-amber-400"
        />
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Tab switch detected ({tabSwitches}). Please stay on the test page.
        </p>
        <button
          onClick={onDismiss}
          className="ml-2 text-sm font-semibold text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
