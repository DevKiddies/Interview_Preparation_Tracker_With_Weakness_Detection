// Mock data for the student dashboard.
// Centralised here so a real API response can swap in later without touching components.

export const userProfile = {
  name: "John Doe",
  firstName: "John",
  initials: "JD",
  target: "SDE-1 Target",
  prepProgress: 30, // %
  streakDays: 14,
  daysLeft: 84,
  avgScore: 76,
  rank: 124,
};

export const dashboardStats = [
  {
    id: "streak",
    label: "Streak",
    value: "14 Days",
    sublabel: "+2 from last week",
    sublabelTone: "positive",
    icon: "flame",
    tone: "amber",
  },
  {
    id: "solved",
    label: "Solved",
    value: "128",
    sublabel: "Total problems",
    sublabelTone: "muted",
    icon: "check",
    tone: "emerald",
  },
  {
    id: "avg-score",
    label: "Avg Score",
    value: "76%",
    sublabel: "Top 20% of users",
    sublabelTone: "positive",
    icon: "star",
    tone: "indigo",
  },
  {
    id: "tests-done",
    label: "Tests Done",
    value: "12",
    sublabel: "+3 this month",
    sublabelTone: "muted",
    icon: "trending",
    tone: "teal",
  },
];

export const dangerZone = {
  topic: "Database",
  message:
    "You scored 30% on your last database test. Focus here before your interview.",
};

// Weakness radar — score per topic (0-100).
export const weaknessRadar = [
  { topic: "Web Tech", score: 78 },
  { topic: "Aptitude", score: 62 },
  { topic: "Logic", score: 55 },
  { topic: "OOP Java", score: 40 },
  { topic: "C++", score: 58 },
  { topic: "Database", score: 30 },
];

// Confidence vs Accuracy weekly trend.
export const confidenceAccuracy = {
  "7W": [
    { label: "W1", accuracy: 24, confidence: 40 },
    { label: "W2", accuracy: 35, confidence: 29 },
    { label: "W3", accuracy: 49, confidence: 50 },
    { label: "W4", accuracy: 55, confidence: 46 },
    { label: "W5", accuracy: 59, confidence: 60 },
    { label: "W6", accuracy: 66, confidence: 55 },
    { label: "W7", accuracy: 73, confidence: 71 },
  ],
  "30D": [
    { label: "D1", accuracy: 30, confidence: 38 },
    { label: "D6", accuracy: 38, confidence: 35 },
    { label: "D11", accuracy: 44, confidence: 48 },
    { label: "D16", accuracy: 52, confidence: 50 },
    { label: "D21", accuracy: 58, confidence: 54 },
    { label: "D26", accuracy: 64, confidence: 60 },
    { label: "D30", accuracy: 71, confidence: 68 },
  ],
};

// Activity heatmap — 5 weeks x 7 days, intensity 0-4.
export const activityHeatmap = [
  [0, 2, 3, 4, 0, 1, 0],
  [1, 3, 4, 2, 4, 3, 1],
  [0, 1, 2, 4, 0, 3, 2],
  [4, 3, 2, 1, 4, 0, 4],
  [2, 0, 0, 0, 0, 0, 0],
];

export const quickActions = [
  { id: "resume", label: "Resume Database Course", icon: "book", tone: "indigo", to: "/courses/continue" },
  { id: "quiz", label: "Take Daily Practice Quiz", icon: "zap", tone: "teal", to: "/practice/coding-problems" },
  { id: "results", label: "View Latest Results", icon: "star", tone: "amber", to: "/dashboard/history" },
];

export const recommendations = [
  {
    id: "sql",
    title: "Advanced SQL Queries",
    description: "Master JOINs, Window functions & CTEs",
    badge: "Course",
    badgeTone: "indigo",
    icon: "book",
    cta: "Start",
    ctaTone: "indigo",
  },
  {
    id: "faang",
    title: "FAANG Mock Test #4",
    description: "Full length 90 min assessment",
    badge: "Mock Test",
    badgeTone: "teal",
    icon: "play",
    cta: "Start",
    ctaTone: "teal",
  },
  {
    id: "sliding",
    title: "Sliding Window Pattern",
    description: "5 curated questions on sliding window",
    badge: "Practice",
    badgeTone: "emerald",
    icon: "code",
    cta: "Start",
    ctaTone: "emerald",
  },
];

export const topicProgress = [
  { topic: "Data Structures", value: 72 },
  { topic: "Algorithms", value: 65 },
  { topic: "Database", value: 30 },
  { topic: "JavaScript", value: 88 },
];
