// dashboardData.js — static placeholder data powering the dashboard UI.
// All of these will be replaced with real API responses once the analytics
// backend endpoints are ready. For now they give the UI a realistic look.

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

export const weaknessRadar = [
  { topic: "Web Tech", score: 78 },
  { topic: "Aptitude", score: 62 },
  { topic: "Logic", score: 55 },
  { topic: "OOP Java", score: 40 },
  { topic: "C++", score: 58 },
  { topic: "Database", score: 30 },
];

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

export const quickActions = [
  { id: "mock", label: "Start Mock Test", icon: "zap", tone: "indigo", to: "/practice/mock-tests" },
  { id: "topic", label: "Topic Practice", icon: "book", tone: "teal", to: "/practice/topic-test" },
  { id: "profile", label: "Update Profile", icon: "star", tone: "amber", to: "/profile/settings" },
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
