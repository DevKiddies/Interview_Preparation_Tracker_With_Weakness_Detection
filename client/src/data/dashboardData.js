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

export const topicConfidence = [
  {
    id: 1,
    name: "Data Structures",
    confidence: 88,
  },
  {
    id: 2,
    name: "Algorithms",
    confidence: 74,
  },
  {
    id: 3,
    name: "Database",
    confidence: 39,
  },
  {
    id: 4,
    name: "Operating System",
    confidence: 61,
  },
  {
    id: 5,
    name: "Computer Networks",
    confidence: 47,
  },
];

export const techniqueConfidence = {
  Database: [
    { id: 1, name: "Normalization", confidence: 31 },
    { id: 2, name: "Transactions", confidence: 46 },
    { id: 3, name: "Joins", confidence: 54 },
    { id: 4, name: "Indexes", confidence: 73 },
    { id: 5, name: "Stored Procedures", confidence: 62 },
  ],

  "Data Structures": [
    { id: 1, name: "Arrays", confidence: 91 },
    { id: 2, name: "Linked List", confidence: 84 },
    { id: 3, name: "Stack & Queue", confidence: 79 },
    { id: 4, name: "Trees", confidence: 68 },
    { id: 5, name: "Graphs", confidence: 57 },
  ],

  Algorithms: [
    { id: 1, name: "Binary Search", confidence: 92 },
    { id: 2, name: "Sliding Window", confidence: 76 },
    { id: 3, name: "Two Pointers", confidence: 82 },
    { id: 4, name: "Greedy", confidence: 59 },
    { id: 5, name: "Dynamic Programming", confidence: 37 },
  ],

  "Operating System": [
    { id: 1, name: "Processes", confidence: 74 },
    { id: 2, name: "Threads", confidence: 69 },
    { id: 3, name: "Scheduling", confidence: 56 },
    { id: 4, name: "Deadlocks", confidence: 43 },
    { id: 5, name: "Memory Management", confidence: 65 },
  ],
};

export const confidenceTrend = {
  "7D": [
    { label: "Mon", confidence: 62, accuracy: 58 },
    { label: "Tue", confidence: 66, accuracy: 64 },
    { label: "Wed", confidence: 70, accuracy: 67 },
    { label: "Thu", confidence: 72, accuracy: 71 },
    { label: "Fri", confidence: 75, accuracy: 73 },
    { label: "Sat", confidence: 78, accuracy: 74 },
    { label: "Sun", confidence: 81, accuracy: 79 },
  ],

  "30D": [
    { label: "W1", confidence: 58, accuracy: 55 },
    { label: "W2", confidence: 64, accuracy: 62 },
    { label: "W3", confidence: 71, accuracy: 69 },
    { label: "W4", confidence: 78, accuracy: 76 },
  ],

  "90D": [
    { label: "M1", confidence: 42, accuracy: 39 },
    { label: "M2", confidence: 56, accuracy: 53 },
    { label: "M3", confidence: 78, accuracy: 76 },
  ],
};


export const blindSpotData = [
  { topic: "Trees", count: 31 },
  { topic: "Database", count: 24 },
  { topic: "OS", count: 18 },
  { topic: "Networking", count: 11 },
  { topic: "Graphs", count: 9 },
  { topic: "OOP", count: 7 },
  { topic: "Java", count: 5 },
];

export const accuracyHeatmap = [
  {
    topic: "Arrays",
    easy: 94,
    medium: 81,
    hard: 58,
  },
  {
    topic: "Trees",
    easy: 86,
    medium: 63,
    hard: 34,
  },
  {
    topic: "Graphs",
    easy: 72,
    medium: 49,
    hard: 28,
  },
  {
    topic: "Database",
    easy: 90,
    medium: 67,
    hard: 42,
  },
  {
    topic: "Operating System",
    easy: 84,
    medium: 61,
    hard: 37,
  },
  {
    topic: "Networking",
    easy: 79,
    medium: 73,
    hard: 55,
  },
];