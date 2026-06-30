// MockTestSelectionPage.jsx — test catalogue where users pick either a full
// preset assessment (DSA, OS, DBMS, Networks) or configure a custom topic test.
// Tests marked available: false show a "Coming Soon" badge and are non-clickable.
// Clicking an available test always goes through TestInstructionsPage first so
// the user reads the rules before the timer starts.

import { useNavigate } from "react-router-dom";
import { PlayCircle, Clock, Code2, Database, Server, Globe, Lock, ChevronRight, SlidersHorizontal } from "lucide-react";

const FULL_TESTS = [
  {
    id: "dsa",
    title: "DSA Fundamentals",
    description: "Arrays, HashMaps, Trees, Graphs, Sorting & Dynamic Programming",
    icon: Code2,
    iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    questions: 20,
    timeMins: 90,
    time: "90 min",
    difficulty: "Mixed",
    difficultyColor: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    accent: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20",
    available: true,
  },
  {
    id: "os",
    title: "Operating Systems",
    description: "Processes, Scheduling, Memory Management & Deadlocks",
    icon: Server,
    iconBg: "bg-teal-50 dark:bg-teal-500/10",
    iconColor: "text-teal-600 dark:text-teal-400",
    questions: 20,
    timeMins: 60,
    time: "60 min",
    difficulty: "Medium",
    difficultyColor: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    accent: "bg-teal-500 hover:bg-teal-600 shadow-teal-500/20",
    available: false,
  },
  {
    id: "dbms",
    title: "Database Systems",
    description: "SQL, Normalization, Transactions, Indexing & Optimization",
    icon: Database,
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    questions: 25,
    timeMins: 75,
    time: "75 min",
    difficulty: "Hard",
    difficultyColor: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    accent: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20",
    available: false,
  },
  {
    id: "networks",
    title: "Computer Networks",
    description: "OSI Model, TCP/IP, DNS, HTTP & Routing Protocols",
    icon: Globe,
    iconBg: "bg-purple-50 dark:bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    questions: 20,
    timeMins: 60,
    time: "60 min",
    difficulty: "Medium",
    difficultyColor: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    accent: "bg-purple-500 hover:bg-purple-600 shadow-purple-500/20",
    available: false,
  },
];

export default function MockTestSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Practice Mock Tests
          </h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">
            Choose a full assessment or practice a specific topic with custom settings.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-linear-to-r from-indigo-600 to-violet-600 p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-indigo-200 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Topic Practice</span>
            </div>
            <h2 className="text-lg font-bold text-white">Practice a Specific Topic</h2>
            <p className="mt-0.5 text-sm text-indigo-200">
              Choose any topic from 70+ options — Arrays, Java, SQL, System Design and more.
              Set your own question count and time limit.
            </p>
          </div>
          <button
            onClick={() => navigate("/practice/topic-test")}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition-all duration-150 hover:bg-indigo-50 active:scale-[0.98]"
          >
            <SlidersHorizontal size={15} />
            Configure Test
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Full Assessments
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FULL_TESTS.map((test) => {
            const Icon = test.icon;
            return (
              <div
                key={test.id}
                className={`relative flex flex-col rounded-2xl border bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 ${
                  test.available
                    ? "border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-slate-600 cursor-pointer"
                    : "border-slate-100 dark:border-slate-800 opacity-55 cursor-not-allowed"
                }`}
                // All tests go through the instructions page first, which receives
                // the test config via router state and then navigates to MockTestPage.
                onClick={() =>
                  test.available &&
                  navigate("/practice/instructions", {
                    state: {
                      nextUrl:     `/practice/mock-tests/${test.id}`,
                      nextState:   null,
                      testTitle:   test.title,
                      questions:   test.questions,
                      timeMins:    test.timeMins,
                      difficulty:  test.difficulty,
                      description: test.description,
                    },
                  })
                }
              >
                {!test.available && (
                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <Lock size={9} />
                    Coming Soon
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${test.iconBg}`}>
                    <Icon size={22} className={test.iconColor} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">{test.title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {test.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {test.questions} Questions
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Clock size={11} />
                    {test.time}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${test.difficultyColor}`}>
                    {test.difficulty}
                  </span>
                </div>

                {test.available && (
                  <button
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 active:scale-[0.98] ${test.accent}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/practice/instructions", {
                        state: {
                          nextUrl:     `/practice/mock-tests/${test.id}`,
                          nextState:   null,
                          testTitle:   test.title,
                          questions:   test.questions,
                          timeMins:    test.timeMins,
                          difficulty:  test.difficulty,
                          description: test.description,
                        },
                      });
                    }}
                  >
                    <PlayCircle size={16} />
                    Start Test
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-600">
          All tests are auto-graded with detailed results and category breakdown shown immediately.
        </p>
      </div>
    </div>
  );
}
