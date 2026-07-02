// adminDashboardData.js — Static mock data powering the Admin Dashboard UI.
// Replace all exports with real API calls once backend analytics endpoints are ready.
// Shapes are intentionally matched to expected API response structures.

export const platformStats = [
  {
    id: "total-users",
    label: "Total Users",
    value: "1,284",
    change: "+12.5%",
    changeDir: "up",
    sublabel: "vs last month",
    icon: "users",
    color: "blue",
  },
  {
    id: "active-today",
    label: "Active Today",
    value: "342",
    change: "+8.3%",
    changeDir: "up",
    sublabel: "vs yesterday",
    icon: "user-check",
    color: "emerald",
  },
  {
    id: "total-questions",
    label: "Total Questions",
    value: "2,156",
    change: "+47",
    changeDir: "up",
    sublabel: "added this week",
    icon: "book-open",
    color: "indigo",
  },
  {
    id: "tests-taken",
    label: "Tests Taken",
    value: "8,943",
    change: "+523",
    changeDir: "up",
    sublabel: "this month",
    icon: "clipboard-list",
    color: "teal",
  },
  {
    id: "avg-score",
    label: "Avg Platform Score",
    value: "68%",
    change: "+2.1%",
    changeDir: "up",
    sublabel: "vs last month",
    icon: "trending-up",
    color: "amber",
  },
  {
    id: "banned-users",
    label: "Banned Users",
    value: "17",
    change: "+3",
    changeDir: "up",
    sublabel: "this month",
    icon: "user-x",
    color: "rose",
  },
];

export const userGrowthData = [
  { month: "Dec", users: 640, newUsers: 95 },
  { month: "Jan", users: 780, newUsers: 140 },
  { month: "Feb", users: 920, newUsers: 160 },
  { month: "Mar", users: 1050, newUsers: 130 },
  { month: "Apr", users: 1140, newUsers: 90 },
  { month: "May", users: 1210, newUsers: 70 },
  { month: "Jun", users: 1284, newUsers: 74 },
];

export const dailyActiveUsers = [
  { day: "Mon", dau: 210 },
  { day: "Tue", dau: 285 },
  { day: "Wed", dau: 310 },
  { day: "Thu", dau: 267 },
  { day: "Fri", dau: 342 },
  { day: "Sat", dau: 198 },
  { day: "Sun", dau: 156 },
];

export const questionsByCategory = [
  { name: "Data Structures", value: 420, color: "#3b82f6" },
  { name: "Algorithms",      value: 385, color: "#6366f1" },
  { name: "Database",        value: 310, color: "#14b8a6" },
  { name: "Web Tech",        value: 280, color: "#f59e0b" },
  { name: "OOP",             value: 245, color: "#a855f7" },
  { name: "Aptitude",        value: 220, color: "#10b981" },
  { name: "Other",           value: 296, color: "#94a3b8" },
];

export const weeklyTestCompletion = [
  { topic: "DSA",       completed: 1840, avgScore: 72 },
  { topic: "Algo",      completed: 1560, avgScore: 65 },
  { topic: "Database",  completed: 1230, avgScore: 58 },
  { topic: "Web Tech",  completed: 980,  avgScore: 74 },
  { topic: "OOP",       completed: 870,  avgScore: 61 },
  { topic: "Aptitude",  completed: 760,  avgScore: 69 },
];

export const recentActivity = [
  { id: 1, type: "user_registered", message: "New user registered",    detail: "priya.sharma@gmail.com",          time: "2 min ago",  status: "success" },
  { id: 2, type: "question_added",  message: "Question added to bank", detail: "Binary Tree Traversal — DSA",     time: "8 min ago",  status: "info"    },
  { id: 3, type: "user_banned",     message: "User account suspended", detail: "ID #1042 — policy violation",     time: "25 min ago", status: "warning" },
  { id: 4, type: "test_created",    message: "Mock test created",      detail: "FAANG Full Stack #7",             time: "1 hr ago",   status: "info"    },
  { id: 5, type: "user_registered", message: "New user registered",    detail: "amit.verma@outlook.com",          time: "1 hr ago",   status: "success" },
  { id: 6, type: "high_score",      message: "Perfect score achieved", detail: "Rohan K. — Algorithms Mock #3",  time: "2 hr ago",   status: "success" },
  { id: 7, type: "question_added",  message: "Bulk import completed",  detail: "48 questions — Web Tech added",  time: "3 hr ago",   status: "info"    },
  { id: 8, type: "user_registered", message: "New user registered",    detail: "sneha.patel@yahoo.com",           time: "4 hr ago",   status: "success" },
];

export const topUsers = [
  { rank: 1, name: "Rohan Kumar",  email: "rohan.k@gmail.com",    score: 94, tests: 28, streak: 21 },
  { rank: 2, name: "Priya Sharma", email: "priya.s@gmail.com",    score: 91, tests: 32, streak: 14 },
  { rank: 3, name: "Amit Verma",   email: "amit.v@outlook.com",   score: 88, tests: 25, streak: 18 },
  { rank: 4, name: "Sneha Patel",  email: "sneha.p@yahoo.com",    score: 85, tests: 19, streak: 9  },
  { rank: 5, name: "Karan Singh",  email: "karan.s@gmail.com",    score: 82, tests: 22, streak: 12 },
];

export const platformHealthMetrics = [
  { label: "Avg Session Duration", value: "18 min", icon: "clock",  color: "indigo" },
  { label: "Question Pass Rate",   value: "63.4%",  icon: "check",  color: "emerald" },
  { label: "Test Completion Rate", value: "78.2%",  icon: "target", color: "blue"    },
  { label: "Repeat Visitors",      value: "54%",    icon: "repeat", color: "amber"   },
];
