// adminAnalyticsData.js — Mock data for the Analytics & Reports admin pages.
// Platform Overview, User Reports, and Weakness Analysis all source data from here.
// Replace with real API calls when backend analytics endpoints are ready.

// ── PLATFORM OVERVIEW ────────────────────────────────────────────────────────

export const monthlyGrowthData = [
  { month: "Jul",  newUsers: 12,  totalUsers: 45,  testsRun: 23,  passRate: 62.5, avgAccuracy: 61.2 },
  { month: "Aug",  newUsers: 18,  totalUsers: 63,  testsRun: 41,  passRate: 64.1, avgAccuracy: 62.8 },
  { month: "Sep",  newUsers: 24,  totalUsers: 87,  testsRun: 78,  passRate: 65.8, avgAccuracy: 64.5 },
  { month: "Oct",  newUsers: 31,  totalUsers: 118, testsRun: 112, passRate: 67.2, avgAccuracy: 65.1 },
  { month: "Nov",  newUsers: 28,  totalUsers: 146, testsRun: 98,  passRate: 68.5, avgAccuracy: 66.4 },
  { month: "Dec",  newUsers: 35,  totalUsers: 181, testsRun: 134, passRate: 69.0, avgAccuracy: 67.8 },
  { month: "Jan",  newUsers: 42,  totalUsers: 223, testsRun: 167, passRate: 70.2, avgAccuracy: 68.3 },
  { month: "Feb",  newUsers: 38,  totalUsers: 261, testsRun: 148, passRate: 71.8, avgAccuracy: 69.1 },
  { month: "Mar",  newUsers: 55,  totalUsers: 316, testsRun: 215, passRate: 72.4, avgAccuracy: 70.5 },
  { month: "Apr",  newUsers: 61,  totalUsers: 377, testsRun: 258, passRate: 73.1, avgAccuracy: 71.8 },
  { month: "May",  newUsers: 67,  totalUsers: 444, testsRun: 302, passRate: 74.5, avgAccuracy: 73.2 },
  { month: "Jun",  newUsers: 73,  totalUsers: 517, testsRun: 341, passRate: 75.8, avgAccuracy: 74.9 },
];

export const platformKPIs = {
  totalUsers:      { value: 517,   trend: +16.4, label: "Total Users"        },
  totalTests:      { value: 1917,  trend: +12.9, label: "Total Tests Run"    },
  avgAccuracy:     { value: 74.9,  trend: +1.7,  label: "Avg Accuracy"       },
  passRate:        { value: 75.8,  trend: +1.3,  label: "Pass Rate"          },
  totalQuestions:  { value: 30,    trend: 0,     label: "Questions in Bank"  },
  activeToday:     { value: 34,    trend: +8.2,  label: "Active Today"       },
};

export const topicPerformanceData = [
  { topic: "DSA",        avgAccuracy: 70.4, attempts: 442, passRate: 68.2, color: "#3b82f6" },
  { topic: "Aptitude",   avgAccuracy: 73.6, attempts: 394, passRate: 71.2, color: "#10b981" },
  { topic: "Database",   avgAccuracy: 68.3, attempts: 348, passRate: 65.4, color: "#14b8a6" },
  { topic: "Web Tech",   avgAccuracy: 67.2, attempts: 312, passRate: 64.1, color: "#f59e0b" },
  { topic: "OOP",        avgAccuracy: 65.8, attempts: 297, passRate: 62.5, color: "#a855f7" },
  { topic: "Algorithms", avgAccuracy: 54.1, attempts: 279, passRate: 52.8, color: "#6366f1" },
];

export const platformHealthMetrics = [
  { label: "Question Coverage",     value: 88, desc: "Topics with sufficient questions" },
  { label: "User Onboarding Rate",  value: 76, desc: "Users who completed onboarding"  },
  { label: "Test Completion Rate",  value: 92, desc: "Started tests that were finished" },
  { label: "Email Verification",    value: 84, desc: "Users with verified email"        },
];

// ── USER REPORTS ─────────────────────────────────────────────────────────────

export const experienceLevelData = [
  { level: "Fresher",    count: 187, color: "#3b82f6" },
  { level: "1–2 Years", count: 142, color: "#6366f1" },
  { level: "3–5 Years", count: 98,  color: "#f59e0b" },
  { level: "5+ Years",  count: 90,  color: "#22c55e" },
];

export const authProviderData = [
  { provider: "Email/Password", count: 284, color: "#3b82f6" },
  { provider: "Google",         count: 183, color: "#ef4444" },
  { provider: "GitHub",         count: 50,  color: "#6366f1" },
];

export const targetCompanyData = [
  { company: "Google",    count: 89 },
  { company: "Amazon",    count: 76 },
  { company: "Microsoft", count: 68 },
  { company: "Flipkart",  count: 54 },
  { company: "Infosys",   count: 47 },
  { company: "TCS",       count: 38 },
  { company: "Other",     count: 145 },
];

export const engagementTiers = [
  { tier: "Power Users", desc: "10+ tests",  count: 48,  color: "#3b82f6", bg: "bg-blue-500"    },
  { tier: "Active",      desc: "5–9 tests",  count: 127, color: "#22c55e", bg: "bg-green-500"   },
  { tier: "Moderate",    desc: "2–4 tests",  count: 194, color: "#f59e0b", bg: "bg-amber-400"   },
  { tier: "Casual",      desc: "1 test",     count: 98,  color: "#a855f7", bg: "bg-purple-500"  },
  { tier: "Inactive",    desc: "No tests",   count: 50,  color: "#94a3b8", bg: "bg-slate-400"   },
];

export const topPerformersData = [
  { rank: 1, name: "Aarav Patel",    email: "aarav@example.com",    tests: 24, avgScore: 91.2, streak: 15, topic: "DSA"      },
  { rank: 2, name: "Ananya Singh",   email: "ananya@example.com",   tests: 18, avgScore: 88.7, streak: 12, topic: "Database" },
  { rank: 3, name: "Karthik Nair",   email: "karthik@example.com",  tests: 21, avgScore: 86.4, streak: 9,  topic: "Aptitude" },
  { rank: 4, name: "Vikram Kumar",   email: "vikram@example.com",   tests: 16, avgScore: 84.1, streak: 7,  topic: "Web Tech" },
  { rank: 5, name: "Priya Sharma",   email: "priya@example.com",    tests: 19, avgScore: 82.9, streak: 11, topic: "OOP"      },
  { rank: 6, name: "Dev Mehta",      email: "dev@example.com",      tests: 14, avgScore: 81.5, streak: 6,  topic: "DSA"      },
  { rank: 7, name: "Riya Joshi",     email: "riya@example.com",     tests: 17, avgScore: 79.8, streak: 8,  topic: "Database" },
  { rank: 8, name: "Sneha Gupta",    email: "sneha@example.com",    tests: 15, avgScore: 78.3, streak: 5,  topic: "Aptitude" },
];

// ── WEAKNESS ANALYSIS ─────────────────────────────────────────────────────────

export const categoryWeaknessData = [
  // DSA
  { topic: "DSA",        category: "Graphs",              avgAccuracy: 52.4, attempts: 47,  difficulty: "Medium" },
  { topic: "DSA",        category: "Stacks & Queues",     avgAccuracy: 67.3, attempts: 72,  difficulty: "Mixed"  },
  { topic: "DSA",        category: "Sorting",             avgAccuracy: 61.8, attempts: 38,  difficulty: "Mixed"  },
  { topic: "DSA",        category: "Hashing",             avgAccuracy: 64.2, attempts: 42,  difficulty: "Medium" },
  { topic: "DSA",        category: "Trees",               avgAccuracy: 71.5, attempts: 83,  difficulty: "Mixed"  },
  { topic: "DSA",        category: "Linked Lists",        avgAccuracy: 74.0, attempts: 95,  difficulty: "Mixed"  },
  { topic: "DSA",        category: "Arrays",              avgAccuracy: 82.8, attempts: 112, difficulty: "Easy"   },
  // Algorithms
  { topic: "Algorithms", category: "Backtracking",        avgAccuracy: 38.6, attempts: 29,  difficulty: "Hard"   },
  { topic: "Algorithms", category: "Dynamic Programming", avgAccuracy: 43.2, attempts: 58,  difficulty: "Hard"   },
  { topic: "Algorithms", category: "Divide & Conquer",    avgAccuracy: 55.7, attempts: 41,  difficulty: "Hard"   },
  { topic: "Algorithms", category: "Greedy",              avgAccuracy: 58.3, attempts: 52,  difficulty: "Medium" },
  { topic: "Algorithms", category: "Two Pointers",        avgAccuracy: 62.1, attempts: 34,  difficulty: "Medium" },
  { topic: "Algorithms", category: "Searching",           avgAccuracy: 72.8, attempts: 65,  difficulty: "Easy"   },
  // Database
  { topic: "Database",   category: "NoSQL",               avgAccuracy: 49.3, attempts: 31,  difficulty: "Medium" },
  { topic: "Database",   category: "Transactions",        avgAccuracy: 56.8, attempts: 28,  difficulty: "Hard"   },
  { topic: "Database",   category: "Indexing",            avgAccuracy: 60.4, attempts: 45,  difficulty: "Medium" },
  { topic: "Database",   category: "Normalization",       avgAccuracy: 67.2, attempts: 54,  difficulty: "Medium" },
  { topic: "Database",   category: "Advanced SQL",        avgAccuracy: 71.5, attempts: 87,  difficulty: "Medium" },
  { topic: "Database",   category: "SQL Basics",          avgAccuracy: 84.1, attempts: 103, difficulty: "Easy"   },
  // Web Tech
  { topic: "Web Tech",   category: "Web Security",        avgAccuracy: 53.7, attempts: 48,  difficulty: "Hard"   },
  { topic: "Web Tech",   category: "REST APIs",           avgAccuracy: 61.4, attempts: 39,  difficulty: "Medium" },
  { topic: "Web Tech",   category: "React",               avgAccuracy: 67.8, attempts: 72,  difficulty: "Medium" },
  { topic: "Web Tech",   category: "JavaScript",          avgAccuracy: 70.2, attempts: 86,  difficulty: "Medium" },
  { topic: "Web Tech",   category: "HTTP",                avgAccuracy: 74.5, attempts: 67,  difficulty: "Easy"   },
  { topic: "Web Tech",   category: "HTML/CSS",            avgAccuracy: 79.3, attempts: 58,  difficulty: "Easy"   },
  // OOP
  { topic: "OOP",        category: "SOLID",               avgAccuracy: 48.9, attempts: 35,  difficulty: "Hard"   },
  { topic: "OOP",        category: "Design Patterns",     avgAccuracy: 57.4, attempts: 43,  difficulty: "Medium" },
  { topic: "OOP",        category: "Polymorphism",        avgAccuracy: 63.8, attempts: 51,  difficulty: "Medium" },
  { topic: "OOP",        category: "Encapsulation",       avgAccuracy: 75.2, attempts: 48,  difficulty: "Easy"   },
  { topic: "OOP",        category: "Inheritance",         avgAccuracy: 70.1, attempts: 62,  difficulty: "Easy"   },
  { topic: "OOP",        category: "Classes & Objects",   avgAccuracy: 78.5, attempts: 58,  difficulty: "Easy"   },
  // Aptitude
  { topic: "Aptitude",   category: "Data Interpretation", avgAccuracy: 58.6, attempts: 47,  difficulty: "Medium" },
  { topic: "Aptitude",   category: "Puzzles",             avgAccuracy: 65.3, attempts: 58,  difficulty: "Medium" },
  { topic: "Aptitude",   category: "Logical Reasoning",   avgAccuracy: 71.8, attempts: 84,  difficulty: "Medium" },
  { topic: "Aptitude",   category: "Verbal",              avgAccuracy: 73.4, attempts: 42,  difficulty: "Easy"   },
  { topic: "Aptitude",   category: "Quantitative",        avgAccuracy: 77.2, attempts: 96,  difficulty: "Easy"   },
];

export const mostMissedQuestions = [
  { id: 10, text: "In which scenario is the Greedy approach guaranteed to produce an optimal solution?", topic: "Algorithms", category: "Greedy",              difficulty: "Hard",   correctRate: 32.4 },
  { id: 24, text: "What does the Liskov Substitution Principle (LSP) state?",                           topic: "OOP",        category: "SOLID",               difficulty: "Hard",   correctRate: 38.7 },
  { id: 11, text: "What does the Master Theorem help solve?",                                           topic: "Algorithms", category: "Divide & Conquer",    difficulty: "Hard",   correctRate: 41.2 },
  { id: 9,  text: "What is the key idea behind Dynamic Programming?",                                   topic: "Algorithms", category: "Dynamic Programming", difficulty: "Medium", correctRate: 44.1 },
  { id: 20, text: "What does CORS stand for and what does it control?",                                 topic: "Web Tech",   category: "Web Security",        difficulty: "Hard",   correctRate: 46.8 },
  { id: 3,  text: "What is the worst-case time complexity of QuickSort?",                               topic: "DSA",        category: "Sorting",             difficulty: "Hard",   correctRate: 49.3 },
  { id: 14, text: "What is the difference between INNER JOIN and LEFT JOIN?",                           topic: "Database",   category: "Advanced SQL",        difficulty: "Medium", correctRate: 51.7 },
];

export const accuracyTrendData = [
  { month: "Jul", avgAccuracy: 61.2 },
  { month: "Aug", avgAccuracy: 62.8 },
  { month: "Sep", avgAccuracy: 64.5 },
  { month: "Oct", avgAccuracy: 65.1 },
  { month: "Nov", avgAccuracy: 66.4 },
  { month: "Dec", avgAccuracy: 67.8 },
  { month: "Jan", avgAccuracy: 68.3 },
  { month: "Feb", avgAccuracy: 69.1 },
  { month: "Mar", avgAccuracy: 70.5 },
  { month: "Apr", avgAccuracy: 71.8 },
  { month: "May", avgAccuracy: 73.2 },
  { month: "Jun", avgAccuracy: 74.9 },
];
