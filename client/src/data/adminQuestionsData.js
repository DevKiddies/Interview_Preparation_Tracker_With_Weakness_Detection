// adminQuestionsData.js — Mock data for the admin Question Management pages.
// Shape mirrors the current Supabase schema:
//   categories(id, name)              — top-level grouping, e.g. "DSA"
//   topics(id, name, category_id)     — belongs to ONE category, e.g. "Arrays" -> DSA
//   techniques(id, name)              — reusable technique tags, e.g. "Two Pointers"
//   technique_topics(technique_id, topic_id) — many-to-many join
//   companies(id, name, type)         — optional company tag on a question
//   questions(id, question, option_a..d, correct_answer, category_id, topic_id,
//             difficulty, question_type, technique_id, company_id)
// Replace the *Data exports with real GET calls when the admin API is ready.

export const categoriesData = [
  { id: 1, name: "DSA",        label: "Data Structures & Algorithms", color: "blue" },
  { id: 2, name: "Algorithms", label: "Algorithms",                   color: "indigo" },
  { id: 3, name: "Database",   label: "Database",                     color: "teal" },
  { id: 4, name: "Web Tech",   label: "Web Technologies",             color: "amber" },
  { id: 5, name: "OOP",        label: "Object-Oriented Programming",  color: "purple" },
  { id: 6, name: "Aptitude",   label: "Aptitude",                     color: "emerald" },
];

export const topicsData = [
  // ── DSA ──────────────────────────────────────────────────────────────────
  { id: 1,  name: "Arrays",              categoryId: 1 },
  { id: 2,  name: "Linked Lists",        categoryId: 1 },
  { id: 3,  name: "Trees",               categoryId: 1 },
  { id: 4,  name: "Graphs",              categoryId: 1 },
  { id: 5,  name: "Stacks & Queues",     categoryId: 1 },
  { id: 6,  name: "Sorting",             categoryId: 1 },
  { id: 7,  name: "Hashing",             categoryId: 1 },
  // ── Algorithms ────────────────────────────────────────────────────────────
  { id: 8,  name: "Searching",           categoryId: 2 },
  { id: 9,  name: "Dynamic Programming", categoryId: 2 },
  { id: 10, name: "Greedy",              categoryId: 2 },
  { id: 11, name: "Divide & Conquer",    categoryId: 2 },
  { id: 12, name: "Backtracking",        categoryId: 2 },
  { id: 13, name: "Two Pointers",        categoryId: 2 },
  // ── Database ──────────────────────────────────────────────────────────────
  { id: 14, name: "SQL Basics",          categoryId: 3 },
  { id: 15, name: "Advanced SQL",        categoryId: 3 },
  { id: 16, name: "NoSQL",               categoryId: 3 },
  { id: 17, name: "Indexing",            categoryId: 3 },
  { id: 18, name: "Transactions",        categoryId: 3 },
  { id: 19, name: "Normalization",       categoryId: 3 },
  // ── Web Tech ──────────────────────────────────────────────────────────────
  { id: 20, name: "HTML/CSS",            categoryId: 4 },
  { id: 21, name: "JavaScript",          categoryId: 4 },
  { id: 22, name: "React",               categoryId: 4 },
  { id: 23, name: "REST APIs",           categoryId: 4 },
  { id: 24, name: "HTTP",                categoryId: 4 },
  { id: 25, name: "Web Security",        categoryId: 4 },
  // ── OOP ───────────────────────────────────────────────────────────────────
  { id: 26, name: "Classes & Objects",   categoryId: 5 },
  { id: 27, name: "Inheritance",         categoryId: 5 },
  { id: 28, name: "Polymorphism",        categoryId: 5 },
  { id: 29, name: "Encapsulation",       categoryId: 5 },
  { id: 30, name: "Design Patterns",     categoryId: 5 },
  { id: 31, name: "SOLID",               categoryId: 5 },
  // ── Aptitude ─────────────────────────────────────────────────────────────
  { id: 32, name: "Quantitative",        categoryId: 6 },
  { id: 33, name: "Logical Reasoning",   categoryId: 6 },
  { id: 34, name: "Verbal",              categoryId: 6 },
  { id: 35, name: "Puzzles",             categoryId: 6 },
  { id: 36, name: "Data Interpretation", categoryId: 6 },
];

export const techniquesData = [
  { id: 1,  name: "Two Pointers" },
  { id: 2,  name: "Sliding Window" },
  { id: 3,  name: "Recursion" },
  { id: 4,  name: "Backtracking" },
  { id: 5,  name: "Dynamic Programming" },
  { id: 6,  name: "Greedy" },
  { id: 7,  name: "Binary Search" },
  { id: 8,  name: "DFS/BFS" },
  { id: 9,  name: "Divide & Conquer" },
  { id: 10, name: "Hashing" },
];

// Many-to-many: which techniques are commonly tagged for which topic.
export const techniqueTopicsData = [
  { techniqueId: 1,  topicId: 13 }, // Two Pointers -> Two Pointers
  { techniqueId: 1,  topicId: 1  }, // Two Pointers -> Arrays
  { techniqueId: 2,  topicId: 1  }, // Sliding Window -> Arrays
  { techniqueId: 3,  topicId: 3  }, // Recursion -> Trees
  { techniqueId: 4,  topicId: 12 }, // Backtracking -> Backtracking
  { techniqueId: 5,  topicId: 9  }, // Dynamic Programming -> Dynamic Programming
  { techniqueId: 6,  topicId: 10 }, // Greedy -> Greedy
  { techniqueId: 7,  topicId: 8  }, // Binary Search -> Searching
  { techniqueId: 8,  topicId: 4  }, // DFS/BFS -> Graphs
  { techniqueId: 9,  topicId: 11 }, // Divide & Conquer -> Divide & Conquer
  { techniqueId: 10, topicId: 7  }, // Hashing -> Hashing
];

export const companiesData = [
  { id: 1, name: "Google",    type: "Product" },
  { id: 2, name: "Amazon",    type: "Product" },
  { id: 3, name: "Microsoft", type: "Product" },
  { id: 4, name: "Flipkart",  type: "Product" },
  { id: 5, name: "TCS",       type: "Service" },
  { id: 6, name: "Infosys",   type: "Service" },
  { id: 7, name: "Wipro",     type: "Service" },
  { id: 8, name: "Accenture", type: "Service" },
];

export const difficultyLevels = ["Easy", "Medium", "Hard"];

export const questionsData = [
  // ── DSA ──────────────────────────────────────────────────────────────────
  { id: 1,  question: "What is the time complexity of accessing an element in an array by its index?",                    optionA: "O(n)",        optionB: "O(1)",                   optionC: "O(log n)",            optionD: "O(n²)",             correctAnswer: "B", categoryId: 1, topicId: 1,  difficulty: "Easy"   },
  { id: 2,  question: "Which data structure follows the Last In First Out (LIFO) principle?",                             optionA: "Queue",       optionB: "Array",                  optionC: "Stack",               optionD: "Linked List",       correctAnswer: "C", categoryId: 1, topicId: 5,  difficulty: "Easy"   },
  { id: 3,  question: "What is the worst-case time complexity of QuickSort?",                                             optionA: "O(n log n)",  optionB: "O(n)",                   optionC: "O(n²)",               optionD: "O(n³)",             correctAnswer: "C", categoryId: 1, topicId: 6,  difficulty: "Hard"   },
  { id: 4,  question: "In a Binary Search Tree (BST), which property must always hold?",                                  optionA: "All keys are sorted",  optionB: "Left child < Node < Right child", optionC: "Tree is always balanced",  optionD: "All keys are unique", correctAnswer: "B", categoryId: 1, topicId: 3, difficulty: "Easy"   },
  { id: 5,  question: "What is the space complexity of Depth First Search (DFS) on a graph with V vertices and E edges?", optionA: "O(V²)",       optionB: "O(E)",                   optionC: "O(V)",                optionD: "O(1)",              correctAnswer: "C", categoryId: 1, topicId: 4,  difficulty: "Medium" },
  { id: 6,  question: "Which hashing technique resolves collisions by storing multiple values in the same bucket?",       optionA: "Open Addressing", optionB: "Linear Probing",    optionC: "Chaining",            optionD: "Double Hashing",    correctAnswer: "C", categoryId: 1, topicId: 7,  difficulty: "Medium" },

  // ── Algorithms ────────────────────────────────────────────────────────────
  { id: 7,  question: "What is the time complexity of Binary Search on a sorted array of n elements?",                    optionA: "O(n)",        optionB: "O(n²)",                  optionC: "O(log n)",            optionD: "O(n log n)",        correctAnswer: "C", categoryId: 2, topicId: 8,  difficulty: "Easy"   },
  { id: 8,  question: "Which algorithm is optimal for finding the shortest path in an unweighted graph?",                 optionA: "Dijkstra",    optionB: "BFS",                    optionC: "DFS",                 optionD: "Bellman-Ford",      correctAnswer: "B", categoryId: 2, topicId: 8,  difficulty: "Medium" },
  { id: 9,  question: "What is the key idea behind Dynamic Programming?",                                                 optionA: "Make greedy choices at each step", optionB: "Store solutions to subproblems to avoid recomputation", optionC: "Divide without overlapping subproblems", optionD: "Random sampling", correctAnswer: "B", categoryId: 2, topicId: 9, difficulty: "Medium" },
  { id: 10, question: "In which scenario is the Greedy approach guaranteed to produce an optimal solution?",              optionA: "When subproblems overlap", optionB: "When the problem has optimal substructure and greedy choice property", optionC: "When backtracking is needed", optionD: "Always", correctAnswer: "B", categoryId: 2, topicId: 10, difficulty: "Hard" },
  { id: 11, question: "What does the Master Theorem help solve?",                                                         optionA: "Graph shortest paths", optionB: "Recurrences for divide-and-conquer algorithms", optionC: "Dynamic programming recurrences", optionD: "Sorting algorithms", correctAnswer: "B", categoryId: 2, topicId: 11, difficulty: "Hard" },

  // ── Database ──────────────────────────────────────────────────────────────
  { id: 12, question: "What does the SQL SELECT statement do?",                                                           optionA: "Deletes records",  optionB: "Updates rows",         optionC: "Retrieves data",      optionD: "Creates tables",    correctAnswer: "C", categoryId: 3, topicId: 14, difficulty: "Easy"   },
  { id: 13, question: "What is a foreign key in a relational database?",                                                  optionA: "The primary key of the current table", optionB: "A key that references a primary key in another table", optionC: "An encrypted key", optionD: "A composite index", correctAnswer: "B", categoryId: 3, topicId: 14, difficulty: "Easy" },
  { id: 14, question: "What is the difference between INNER JOIN and LEFT JOIN?",                                         optionA: "No difference",  optionB: "LEFT JOIN returns all rows from the left table even without a match", optionC: "INNER JOIN returns all rows from both tables", optionD: "LEFT JOIN only returns matched rows", correctAnswer: "B", categoryId: 3, topicId: 15, difficulty: "Medium" },
  { id: 15, question: "What is the primary goal of database normalization?",                                              optionA: "Speed up all queries", optionB: "Reduce data redundancy and dependency", optionC: "Add more indexes", optionD: "Encrypt sensitive data", correctAnswer: "B", categoryId: 3, topicId: 19, difficulty: "Medium" },
  { id: 16, question: "Which SQL clause is used to filter rows based on a condition?",                                    optionA: "ORDER BY",    optionB: "GROUP BY",               optionC: "WHERE",               optionD: "HAVING",            correctAnswer: "C", categoryId: 3, topicId: 14, difficulty: "Easy"   },

  // ── Web Tech ──────────────────────────────────────────────────────────────
  { id: 17, question: "What is the difference between == and === in JavaScript?",                                         optionA: "No difference", optionB: "=== checks value and type, == only checks value after coercion", optionC: "== checks type only", optionD: "=== is always slower", correctAnswer: "B", categoryId: 4, topicId: 21, difficulty: "Medium" },
  { id: 18, question: "Which HTTP status code indicates that the requested resource was not found?",                      optionA: "200",         optionB: "301",                    optionC: "500",                 optionD: "404",               correctAnswer: "D", categoryId: 4, topicId: 24, difficulty: "Easy"   },
  { id: 19, question: "What is the primary purpose of React's useEffect hook?",                                           optionA: "Manage component state", optionB: "Perform side effects in functional components", optionC: "Render child components", optionD: "Apply CSS styles", correctAnswer: "B", categoryId: 4, topicId: 22, difficulty: "Medium" },
  { id: 20, question: "What does CORS stand for and what does it control?",                                               optionA: "Cross-Origin Resource Sharing — controls which origins can access your API", optionB: "Client-Origin Routing System — handles client-side routing", optionC: "Content-Object Request Schema — defines request formats", optionD: "Cross-Object React State — manages shared state", correctAnswer: "A", categoryId: 4, topicId: 25, difficulty: "Hard" },
  { id: 21, question: "Which CSS property is used to make a flex container wrap its items onto multiple lines?",          optionA: "flex-direction: wrap", optionB: "flex-wrap: wrap",    optionC: "overflow: wrap",      optionD: "display: flex-wrap",correctAnswer: "B", categoryId: 4, topicId: 20, difficulty: "Easy"   },

  // ── OOP ───────────────────────────────────────────────────────────────────
  { id: 22, question: "What is encapsulation in Object-Oriented Programming?",                                            optionA: "Hiding internal implementation details and exposing only necessary interfaces", optionB: "Inheriting properties from a parent class", optionC: "Having multiple classes with different implementations", optionD: "Defining multiple methods with the same name", correctAnswer: "A", categoryId: 5, topicId: 29, difficulty: "Easy" },
  { id: 23, question: "What is polymorphism in OOP?",                                                                     optionA: "Having multiple constructors", optionB: "The ability of different objects to respond to the same interface in different ways", optionC: "Hiding data from external classes", optionD: "A class extending another class", correctAnswer: "B", categoryId: 5, topicId: 28, difficulty: "Medium" },
  { id: 24, question: "What does the Liskov Substitution Principle (LSP) state?",                                         optionA: "Classes should be open for extension, closed for modification", optionB: "Objects of a subclass should be substitutable for objects of the superclass without breaking behaviour", optionC: "Classes should depend on abstractions", optionD: "Each class should have a single responsibility", correctAnswer: "B", categoryId: 5, topicId: 31, difficulty: "Hard" },
  { id: 25, question: "Which OOP concept allows a derived class to inherit properties and behaviour from a base class?",  optionA: "Polymorphism", optionB: "Encapsulation",          optionC: "Inheritance",         optionD: "Abstraction",       correctAnswer: "C", categoryId: 5, topicId: 27, difficulty: "Easy"   },

  // ── Aptitude ─────────────────────────────────────────────────────────────
  { id: 26, question: "If 5 pens cost ₹25, what is the cost of 8 pens?",                                                 optionA: "₹40",         optionB: "₹35",                    optionC: "₹45",                 optionD: "₹30",               correctAnswer: "A", categoryId: 6, topicId: 32, difficulty: "Easy"   },
  { id: 27, question: "A train travels 240 km in 4 hours. What is its average speed?",                                    optionA: "50 km/h",     optionB: "60 km/h",                optionC: "70 km/h",             optionD: "80 km/h",           correctAnswer: "B", categoryId: 6, topicId: 32, difficulty: "Easy"   },
  { id: 28, question: "In how many ways can 5 people be arranged in a row?",                                              optionA: "25",          optionB: "60",                     optionC: "120",                 optionD: "240",               correctAnswer: "C", categoryId: 6, topicId: 35, difficulty: "Medium" },
  { id: 29, question: "If A can do a job in 10 days and B in 15 days, how many days do they take working together?",     optionA: "4",           optionB: "5",                      optionC: "6",                   optionD: "8",                 correctAnswer: "C", categoryId: 6, topicId: 32, difficulty: "Medium" },
  { id: 30, question: "What comes next in the sequence: 2, 6, 12, 20, 30, ?",                                            optionA: "40",          optionB: "42",                     optionC: "44",                  optionD: "45",                correctAnswer: "B", categoryId: 6, topicId: 33, difficulty: "Hard" },
];
