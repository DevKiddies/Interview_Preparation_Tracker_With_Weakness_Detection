// TopicTestConfigPage.jsx — custom test builder for focused topic practice.
// Users search and pick a topic from 70+ options grouped by domain, then choose
// how many questions (5–50) and how long (10–90 min) before hitting Start.
// All config is passed through router state to TestInstructionsPage → MockTestPage.

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, PlayCircle, Clock, BookOpen, ChevronRight, X, Target, Sparkles } from "lucide-react";
import API_BASE from "../utils/api.js";
import { getCachedProfile, setCachedProfile } from "../utils/profileCache";

const TOPIC_GROUPS = [
  {
    label: "Languages",
    color: "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/20",
    active: "bg-violet-600 text-white shadow-violet-500/20",
    topics: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift"],
  },
  {
    label: "Data Structures & Algorithms",
    color: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20",
    active: "bg-indigo-600 text-white shadow-indigo-500/20",
    topics: [
      "Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Heaps", "Tries",
      "Hashing", "Sorting & Searching", "Recursion", "Dynamic Programming",
      "Greedy Algorithms", "Backtracking", "Bit Manipulation",
      "Sliding Window", "Two Pointers", "Binary Search", "Divide & Conquer",
    ],
  },
  {
    label: "OOP & Design",
    color: "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-500/20",
    active: "bg-teal-600 text-white shadow-teal-500/20",
    topics: ["OOP Concepts", "OOP in Java", "Design Patterns", "SOLID Principles"],
  },
  {
    label: "System Design",
    color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-500/20",
    active: "bg-cyan-600 text-white shadow-cyan-500/20",
    topics: [
      "System Design", "Low Level Design", "Microservices", "REST APIs",
      "Message Queues", "Caching", "Load Balancing", "Rate Limiting",
    ],
  },
  {
    label: "Databases",
    color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20",
    active: "bg-emerald-600 text-white shadow-emerald-500/20",
    topics: ["SQL", "Database Design", "Indexing & Query Optimization", "Transactions & ACID", "NoSQL", "MongoDB", "Redis"],
  },
  {
    label: "Web & Frameworks",
    color: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20",
    active: "bg-amber-500 text-white shadow-amber-500/20",
    topics: ["Web Programming", "React", "Node.js", "SpringBoot", "Django", "FastAPI"],
  },
  {
    label: "CS Fundamentals",
    color: "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20",
    active: "bg-rose-500 text-white shadow-rose-500/20",
    topics: [
      "Operating Systems", "Process & Threads", "Memory Management",
      "Computer Networks", "TCP/IP", "HTTP & HTTPS",
      "DBMS", "Compiler Design", "Computer Architecture",
    ],
  },
  {
    label: "Tools & Practices",
    color: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
    active: "bg-slate-700 dark:bg-slate-500 text-white",
    topics: ["Git & Version Control", "Docker", "Kubernetes", "CI/CD", "Time & Space Complexity", "Problem Solving"],
  },
];

const QUESTION_OPTIONS = [5, 10, 15, 20, 30, 40];

const TIME_OPTIONS = [
  { label: "10 min",  value: 600 },
  { label: "15 min",  value: 900 },
  { label: "20 min",  value: 1200 },
  { label: "30 min",  value: 1800 },
  { label: "45 min",  value: 2700 },
  { label: "60 min",  value: 3600 },
  { label: "90 min",  value: 5400 },
];

export default function TopicTestConfigPage() {
  const navigate = useNavigate();

  const [search, setSearch]               = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount]   = useState(20);
  const [duration, setDuration]             = useState(1800);
  const [focusTopics, setFocusTopics]       = useState(() => {
    const cached = getCachedProfile();
    return Array.isArray(cached?.focusTopics) ? cached.focusTopics : [];
  });

  // Refresh the onboarded focus topics from the server so highlighting and
  // "Focus Practice" reflect the latest saved selections.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.username) {
            setCachedProfile(data);
            if (Array.isArray(data.focusTopics)) setFocusTopics(data.focusTopics);
          }
        })
        .catch(() => {});
  }, []);

  // Topics that exist both in the practice list and the user's focus list.
  const availableFocusTopics = useMemo(() => {
    const all = new Set(TOPIC_GROUPS.flatMap((g) => g.topics));
    return focusTopics.filter((t) => all.has(t));
  }, [focusTopics]);

  const focusSet = useMemo(() => new Set(availableFocusTopics), [availableFocusTopics]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return TOPIC_GROUPS;
    return TOPIC_GROUPS
      .map((g) => ({ ...g, topics: g.topics.filter((t) => t.toLowerCase().includes(q)) }))
      .filter((g) => g.topics.length > 0);
  }, [search]);

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleStart = () => {
    if (selectedTopics.length === 0) return;
    const topicLabel = selectedTopics.length === 1 ? selectedTopics[0] : `${selectedTopics.length} Topics`;
    navigate("/practice/instructions", {
      state: {
        nextUrl:     "/practice/mock-tests/topic",
        nextState:   { category: selectedTopics, limit: questionCount, duration },
        testTitle:   `${topicLabel} Practice Test`,
        questions:   questionCount,
        timeMins:    Math.round(duration / 60),
        difficulty:  "Custom",
        description: `${questionCount} questions focused on ${selectedTopics.join(", ")}`,
      },
    });
  };

  const timeLabelFor = (v) => TIME_OPTIONS.find((o) => o.value === v)?.label ?? "";

  return (
    <div className="min-h-screen bg-indigo-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Topic Practice
          </h1>
          <p className="mt-1.5 text-slate-500 dark:text-slate-400">
            Pick a topic, set your question count & time limit, then start your focused session.
          </p>
        </div>

        <div className="space-y-4">

          {/* Focus Practice shortcut — one tap pre-selects all onboarded focus topics */}
          {availableFocusTopics.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/10 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    <Sparkles size={14} className="text-emerald-500" />
                    Your Focus Topics
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {availableFocusTopics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopics((prev) => {
                    const merged = [...new Set([...prev, ...availableFocusTopics])];
                    return merged;
                  })}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-700 active:scale-95"
                >
                  <Target size={13} />
                  Focus Practice
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
              1 &nbsp;·&nbsp; Choose a Topic
            </p>

            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-9 pr-9 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-5 pr-1">
              {filteredGroups.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  No topics match "{search}"
                </p>
              ) : (
                filteredGroups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {group.label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.topics.map((topic) => {
                        const isActive = selectedTopics.includes(topic);
                        const isFocus = focusSet.has(topic);
                        return (
                          <button
                            key={topic}
                            onClick={() => toggleTopic(topic)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 shadow-sm ${
                              isActive ? group.active : group.color
                            } ${isFocus && !isActive ? "ring-2 ring-emerald-400/70 dark:ring-emerald-500/60" : ""}`}
                          >
                            {topic}
                            {isFocus && !isActive && (
                              <span className="ml-1 align-middle text-[9px] font-bold uppercase tracking-wide opacity-70">★</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedTopics.length > 0 && (
              <div className="mt-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <BookOpen size={13} />
                    {selectedTopics.length} topic{selectedTopics.length > 1 ? "s" : ""} selected
                  </span>
                  <button
                    onClick={() => setSelectedTopics([])}
                    className="text-xs text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTopics.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      {t}
                      <button onClick={() => toggleTopic(t)} className="ml-0.5 opacity-70 hover:opacity-100">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
              2 &nbsp;·&nbsp; Number of Questions
            </p>
            <div className="flex flex-wrap gap-2">
              {QUESTION_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`min-w-14 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-150 active:scale-95 ${
                    questionCount === n
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Clock size={14} className="text-slate-400" />
              3 &nbsp;·&nbsp; Time Limit
            </p>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setDuration(value)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-150 active:scale-95 ${
                    duration === value
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="mb-5 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden">
              <div className="px-4 py-3 text-center">
                <p className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedTopics.length > 0 ? (
                    <span className="truncate block max-w-full text-sm">
                      {selectedTopics.length === 1 ? selectedTopics[0] : `${selectedTopics.length} Topics`}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">Topic</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{questionCount}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">Questions</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{timeLabelFor(duration)}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">Time</p>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={selectedTopics.length === 0}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-all duration-150 active:scale-[0.98] ${
                selectedTopics.length > 0
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 cursor-pointer"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
              }`}
            >
              <PlayCircle size={16} />
              {selectedTopics.length === 0
                ? "Select a topic to begin"
                : selectedTopics.length === 1
                ? `Start ${selectedTopics[0]} Test`
                : `Start Test (${selectedTopics.length} Topics)`}
              {selectedTopics.length > 0 && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
