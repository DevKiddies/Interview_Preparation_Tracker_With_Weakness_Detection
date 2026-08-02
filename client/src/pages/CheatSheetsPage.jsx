// CheatSheetsPage.jsx — Resources > Cheat Sheets. Dense, table-first quick-reference
// content (complexity tables, formulas, quick tricks) for last-minute revision —
// deliberately terser than NotesPage, which favors worked explanations over lookup
// tables. Structure mirrors NotesPage (sidebar TOC + scrollspy) for consistency.

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const sections = [
  {
    id: "complexity",
    subject: "Complexity Cheat Sheet",
    topics: [
      {
        id: "big-o-chart",
        title: "Big-O Growth Chart",
        blocks: [
          {
            type: "table",
            headers: ["Notation", "Name", "Example"],
            rows: [
              ["O(1)", "Constant", "Array index access, hash table lookup"],
              ["O(log n)", "Logarithmic", "Binary search, balanced BST operations"],
              ["O(n)", "Linear", "Linear search, array/list traversal"],
              ["O(n log n)", "Linearithmic", "Merge sort, heap sort, quicksort (average)"],
              ["O(n²)", "Quadratic", "Bubble/selection/insertion sort, nested loops"],
              ["O(n³)", "Cubic", "Floyd-Warshall, naive matrix multiplication"],
              ["O(2ⁿ)", "Exponential", "Recursive Fibonacci (no memo), generating subsets"],
              ["O(n!)", "Factorial", "Generating all permutations, brute-force TSP"],
            ],
          },
          {
            type: "note",
            text: "Ordered smallest to largest: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!). When in doubt about a nested loop's complexity, count the loops — each independent nested loop over n multiplies, not adds.",
          },
        ],
      },
      {
        id: "ds-operations",
        title: "Data Structure Operations",
        blocks: [
          {
            type: "table",
            headers: ["Data Structure", "Access", "Search", "Insert", "Delete"],
            rows: [
              ["Array", "O(1)", "O(n)", "O(n)", "O(n)"],
              ["Linked List", "O(n)", "O(n)", "O(1)*", "O(1)*"],
              ["Stack", "O(n)", "O(n)", "O(1)", "O(1)"],
              ["Queue", "O(n)", "O(n)", "O(1)", "O(1)"],
              ["Hash Table", "—", "O(1) avg", "O(1) avg", "O(1) avg"],
              ["Binary Search Tree", "O(log n) avg", "O(log n) avg", "O(log n) avg", "O(log n) avg"],
              ["Balanced BST (AVL/Red-Black)", "O(log n)", "O(log n)", "O(log n)", "O(log n)"],
              ["Binary Heap", "O(1) min/max", "O(n)", "O(log n)", "O(log n)"],
              ["Trie", "—", "O(k)", "O(k)", "O(k)"],
            ],
          },
          {
            type: "note",
            text: "* Linked list insert/delete is O(1) only at a known position (e.g. the head, or right after a given node) — finding that position first is still O(n). Hash tables and unbalanced BSTs degrade to O(n) worst case (hash collisions / a BST that's really a linked list); AVL/Red-Black trees guarantee O(log n) worst case. Trie complexity is in terms of key length k, not n.",
          },
        ],
      },
      {
        id: "sorting-algorithms",
        title: "Sorting Algorithms",
        blocks: [
          {
            type: "table",
            headers: ["Algorithm", "Best", "Average", "Worst", "Space", "Stable"],
            rows: [
              ["Bubble Sort", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes"],
              ["Selection Sort", "O(n²)", "O(n²)", "O(n²)", "O(1)", "No"],
              ["Insertion Sort", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes"],
              ["Merge Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
              ["Quick Sort", "O(n log n)", "O(n log n)", "O(n²)", "O(log n)", "No"],
              ["Heap Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "No"],
              ["Counting Sort", "O(n+k)", "O(n+k)", "O(n+k)", "O(n+k)", "Yes"],
              ["Radix Sort", "O(nk)", "O(nk)", "O(nk)", "O(n+k)", "Yes"],
              ["Bucket Sort", "O(n+k)", "O(n+k)", "O(n²)", "O(n)", "Yes"],
            ],
          },
          {
            type: "note",
            text: "Interview default: Merge Sort when stability or worst-case guarantees matter, Quick Sort when average-case speed and in-place (low memory) matter. Counting/Radix/Bucket only beat O(n log n) when the input has exploitable structure (small integer range, fixed-width keys, uniform distribution).",
          },
        ],
      },
      {
        id: "graph-algorithms",
        title: "Graph & Search Algorithms",
        blocks: [
          {
            type: "table",
            headers: ["Algorithm", "Complexity", "Use Case"],
            rows: [
              ["Linear Search", "O(n)", "Unsorted array"],
              ["Binary Search", "O(log n)", "Sorted array"],
              ["BFS", "O(V + E)", "Shortest path (unweighted), level-order traversal"],
              ["DFS", "O(V + E)", "Cycle detection, connected components, topological sort"],
              ["Dijkstra's (min-heap)", "O((V + E) log V)", "Shortest path, non-negative weights"],
              ["Bellman-Ford", "O(V · E)", "Shortest path, handles negative weights"],
              ["Floyd-Warshall", "O(V³)", "All-pairs shortest path"],
              ["Kruskal's (MST)", "O(E log E)", "Minimum spanning tree, uses Union-Find"],
              ["Prim's (MST, min-heap)", "O(E log V)", "Minimum spanning tree"],
              ["Topological Sort", "O(V + E)", "Ordering a DAG (Kahn's or DFS-based)"],
            ],
          },
        ],
      },
      {
        id: "recursion-master-theorem",
        title: "Recursion & Master Theorem",
        blocks: [
          {
            type: "p",
            text: "For a divide-and-conquer recurrence T(n) = aT(n/b) + f(n) — a subproblems, each of size n/b, plus f(n) work to combine — compare f(n) against n^(log_b a):",
          },
          {
            type: "ul",
            items: [
              "Case 1 — f(n) grows slower than n^(log_b a): T(n) = Θ(n^(log_b a)). Example: T(n) = 8T(n/2) + O(n²) → Θ(n³).",
              "Case 2 — f(n) grows at the same rate: T(n) = Θ(n^(log_b a) · log n). Example: Merge sort, T(n) = 2T(n/2) + O(n) → Θ(n log n).",
              "Case 3 — f(n) grows faster than n^(log_b a) (and satisfies the regularity condition): T(n) = Θ(f(n)). Example: T(n) = 2T(n/2) + O(n²) → Θ(n²).",
            ],
          },
          {
            type: "table",
            headers: ["Recurrence", "Complexity", "Example"],
            rows: [
              ["T(n) = T(n/2) + O(1)", "O(log n)", "Binary search"],
              ["T(n) = 2T(n/2) + O(n)", "O(n log n)", "Merge sort"],
              ["T(n) = T(n-1) + O(1)", "O(n)", "Simple linear recursion"],
              ["T(n) = T(n-1) + O(n)", "O(n²)", "Recursive selection sort"],
              ["T(n) = 2T(n-1) + O(1)", "O(2ⁿ)", "Naive recursive Fibonacci"],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "math",
    subject: "Math & Aptitude Formulas",
    topics: [
      {
        id: "percentages-profit-loss",
        title: "Percentages & Profit/Loss",
        blocks: [
          {
            type: "formulas",
            items: [
              { name: "x is what % of y", formula: "(x / y) × 100" },
              { name: "Successive % change (a%, then b%)", formula: "Net % = a + b + (ab / 100)" },
              { name: "Increase x%, then decrease x%", formula: "Net change = −(x² / 100) %" },
              { name: "Profit %", formula: "((SP − CP) / CP) × 100" },
              { name: "Loss %", formula: "((CP − SP) / CP) × 100" },
              { name: "Selling Price (from profit %)", formula: "SP = CP × (1 + profit% / 100)" },
              { name: "Selling Price (from loss %)", formula: "SP = CP × (1 − loss% / 100)" },
            ],
          },
        ],
      },
      {
        id: "interest",
        title: "Simple & Compound Interest",
        blocks: [
          {
            type: "formulas",
            items: [
              { name: "Simple Interest", formula: "SI = (P × R × T) / 100" },
              { name: "Amount (Simple Interest)", formula: "A = P + SI" },
              { name: "Compound Interest", formula: "CI = P(1 + R/100)ᵀ − P" },
              { name: "Amount (Compound Interest)", formula: "A = P(1 + R/100)ᵀ" },
            ],
          },
          {
            type: "note",
            text: "P = principal, R = rate per period (%), T = number of periods. If interest compounds half-yearly/quarterly, divide R by the number of periods per year and multiply T by the same factor before applying the CI formula.",
          },
        ],
      },
      {
        id: "permutations-probability",
        title: "Permutations, Combinations & Probability",
        blocks: [
          {
            type: "formulas",
            items: [
              { name: "Permutations (order matters)", formula: "nPr = n! / (n − r)!" },
              { name: "Combinations (order doesn't matter)", formula: "nCr = n! / (r!(n − r)!)" },
              { name: "Circular permutations", formula: "(n − 1)!" },
              { name: "Probability of event A", formula: "P(A) = favorable outcomes / total outcomes" },
              { name: "Union (either A or B)", formula: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)" },
              { name: "Conditional probability", formula: "P(A | B) = P(A ∩ B) / P(B)" },
            ],
          },
        ],
      },
      {
        id: "progressions",
        title: "Progressions (AP / GP)",
        blocks: [
          {
            type: "formulas",
            items: [
              { name: "AP — nth term", formula: "aₙ = a + (n − 1)d" },
              { name: "AP — sum of n terms", formula: "Sₙ = n/2 × [2a + (n − 1)d]" },
              { name: "GP — nth term", formula: "aₙ = a × r^(n − 1)" },
              { name: "GP — sum of n terms (r ≠ 1)", formula: "Sₙ = a(rⁿ − 1) / (r − 1)" },
            ],
          },
        ],
      },
      {
        id: "time-speed-work",
        title: "Time, Speed, Distance & Work",
        blocks: [
          {
            type: "formulas",
            items: [
              { name: "Speed", formula: "Speed = Distance / Time" },
              { name: "km/h → m/s", formula: "multiply by 5/18" },
              { name: "m/s → km/h", formula: "multiply by 18/5" },
              { name: "Relative speed — same direction", formula: "|s₁ − s₂|" },
              { name: "Relative speed — opposite directions", formula: "s₁ + s₂" },
              { name: "Work rate", formula: "If A finishes in 'a' days, A's rate = 1/a work/day" },
              { name: "Combined work rate (A + B)", formula: "1/a + 1/b" },
              { name: "Time to finish together", formula: "1 / (combined rate)" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "programming",
    subject: "Programming Quick Reference",
    topics: [
      {
        id: "bit-tricks",
        title: "Bit Manipulation Tricks",
        blocks: [
          {
            type: "code",
            label: "Common bit tricks",
            code:
`n & 1                 // check even (0) / odd (1)
n & (n - 1)            // clears the lowest set bit — used to count set bits
n & (-n)               // isolates the lowest set bit
n && !(n & (n - 1))     // true if n is a power of 2
n ^ (1 << k)            // toggle bit k
n | (1 << k)            // set bit k
n & ~(1 << k)           // clear bit k
(n >> k) & 1            // read bit k

// swap two integers without a temp variable
a ^= b;
b ^= a;
a ^= b;`,
          },
          {
            type: "note",
            text: "Brian Kernighan's algorithm (repeatedly doing n &= n - 1 until n is 0) counts set bits in O(set bits) time instead of O(total bits) — comes up constantly in 'Number of 1 Bits' style problems.",
          },
        ],
      },
      {
        id: "sql-reference",
        title: "SQL Quick Reference",
        blocks: [
          {
            type: "p",
            text: "Clauses are written in this order but the database actually executes them in a different order — knowing the execution order explains why you can't reference a SELECT alias inside WHERE (WHERE runs before SELECT), but you can in ORDER BY (which runs after).",
          },
          {
            type: "table",
            headers: ["Written Order", "Executed Order"],
            rows: [
              ["1. SELECT", "1. FROM"],
              ["2. FROM", "2. WHERE"],
              ["3. WHERE", "3. GROUP BY"],
              ["4. GROUP BY", "4. HAVING"],
              ["5. HAVING", "5. SELECT"],
              ["6. ORDER BY", "6. ORDER BY"],
              ["7. LIMIT", "7. LIMIT"],
            ],
          },
          {
            type: "table",
            headers: ["Join", "Returns"],
            rows: [
              ["INNER JOIN", "Only rows with a match in both tables"],
              ["LEFT JOIN", "All rows from the left table, NULLs where the right has no match"],
              ["RIGHT JOIN", "All rows from the right table, NULLs where the left has no match"],
              ["FULL OUTER JOIN", "All rows from both tables, NULLs where either side has no match"],
            ],
          },
          {
            type: "ul",
            items: [
              "COUNT(*) / COUNT(col) — row count (COUNT(col) skips NULLs)",
              "SUM(col), AVG(col), MIN(col), MAX(col) — standard aggregates",
              "WHERE filters rows before grouping; HAVING filters groups after aggregation",
            ],
          },
        ],
      },
      {
        id: "oop-solid-recap",
        title: "OOP & SOLID Recap",
        blocks: [
          {
            type: "ul",
            items: [
              "Encapsulation — bundle data with the methods that use it; hide internal state.",
              "Abstraction — expose what an object does, hide how it does it.",
              "Inheritance — model an 'is-a' relationship; reuse/extend a parent's behavior.",
              "Polymorphism — the same call behaves differently depending on the runtime type.",
              "S — Single Responsibility: one reason to change.",
              "O — Open/Closed: open to extension, closed to modification.",
              "L — Liskov Substitution: a subclass must be usable wherever the parent is expected.",
              "I — Interface Segregation: many small interfaces beat one bloated one.",
              "D — Dependency Inversion: depend on abstractions, not concrete implementations.",
            ],
          },
          {
            type: "note",
            text: "This is the compressed recap for a last-minute check — see Notes → Object-Oriented Programming for the full explanations and code examples.",
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
      <table className="w-full text-sm border-collapse min-w-max">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/60">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-800/30"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap ${
                    j === 0
                      ? "font-semibold text-slate-800 dark:text-slate-100"
                      : "font-mono text-[13px]"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Formulas({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <div
          key={it.name}
          className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1.5">
            {it.name}
          </p>
          <p className="font-mono text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {it.formula}
          </p>
        </div>
      ))}
    </div>
  );
}

function Block({ block }) {
  if (block.type === "p") {
    return (
      <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">
        {block.text}
      </p>
    );
  }

  if (block.type === "ul") {
    return (
      <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "table") {
    return <Table headers={block.headers} rows={block.rows} />;
  }

  if (block.type === "formulas") {
    return <Formulas items={block.items} />;
  }

  if (block.type === "code") {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-800 shadow-sm">
        {block.label && (
          <div className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold uppercase tracking-wide">
            {block.label}
          </div>
        )}
        <pre className="bg-slate-950 text-slate-100 text-[13px] leading-relaxed p-4 overflow-x-auto">
          <code>{block.code}</code>
        </pre>
      </div>
    );
  }

  if (block.type === "note") {
    return (
      <div className="rounded-xl border-l-4 border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/10 pl-4 pr-4 py-3">
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            Note —{" "}
          </span>
          {block.text}
        </p>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CheatSheetsPage() {
  const [activeId, setActiveId] = useState(sections[0].topics[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const headings = sections.flatMap((s) => s.topics.map((t) => t.id));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const jumpTo = (id) => {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <section className="pt-16 pb-10 px-6 text-center">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Resources
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Cheat Sheets
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Complexity tables, formulas, and quick tricks for last-minute
          revision — no explanations, just the lookup.
        </p>
      </section>

      {/* Mobile: jump-to dropdown */}
      <div className="lg:hidden sticky top-15 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-y border-slate-100 dark:border-slate-800 px-6 py-3">
        <button
          type="button"
          onClick={() => setMobileNavOpen((o) => !o)}
          className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span className="flex items-center gap-2">
            <Menu size={16} />
            Contents
          </span>
          {mobileNavOpen && <X size={16} />}
        </button>
        {mobileNavOpen && (
          <div className="mt-3 flex flex-col gap-4 max-h-[60vh] overflow-y-auto pb-2">
            {sections.map((s) => (
              <div key={s.id}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  {s.subject}
                </p>
                <div className="flex flex-col gap-1">
                  {s.topics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => jumpTo(t.id)}
                      className={`text-left text-sm py-1 ${
                        activeId === t.id
                          ? "text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body: sidebar + content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 flex flex-col gap-6">
            {sections.map((s) => (
              <div key={s.id}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                  {s.subject}
                </p>
                <ul className="flex flex-col gap-1 border-l border-slate-100 dark:border-slate-800">
                  {s.topics.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          jumpTo(t.id);
                        }}
                        className={`block pl-3 -ml-px py-1 text-sm border-l-2 transition-colors ${
                          activeId === t.id
                            ? "border-blue-600 text-blue-600 dark:text-blue-400 font-semibold"
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        {t.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col gap-20">
          {sections.map((s) => (
            <section key={s.id}>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-8 pb-3 border-b border-slate-100 dark:border-slate-800">
                {s.subject}
              </h2>
              <div className="flex flex-col gap-14">
                {s.topics.map((t) => (
                  <article key={t.id} id={t.id} className="scroll-mt-32">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                      {t.title}
                    </h3>
                    <div className="flex flex-col gap-4">
                      {t.blocks.map((block, i) => (
                        <Block key={i} block={block} />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
