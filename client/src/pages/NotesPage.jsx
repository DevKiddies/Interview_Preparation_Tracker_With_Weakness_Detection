// NotesPage.jsx — Resources > Notes. Detailed revision notes organized as
// Subject -> Topic, docs-style: a sidebar table of contents on the left,
// long-form notes with worked examples and code on the right. Structure
// mirrors the question bank (category -> topic) on purpose.

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const subjects = [
  {
    id: "dsa",
    subject: "Data Structures & Algorithms",
    topics: [
      {
        id: "two-pointers",
        title: "Two Pointers",
        blocks: [
          {
            type: "p",
            text: "Two pointers is the go-to technique whenever you're working with a sorted array (or a problem that becomes easier once sorted) and need to find a pair, triplet, or window that satisfies some condition. Instead of checking every pair with a nested loop, you keep two indices — often one at each end — and move them based on a comparison, cutting an O(n²) scan down to O(n).",
          },
          {
            type: "p",
            text: "The classic setup: low = 0, high = n - 1. Look at nums[low] + nums[high]. If the sum is too small, the only way to increase it is to move low forward (since the array is sorted, that's the only direction that can help). If the sum is too big, move high backward. If it matches, you're done. Each pointer moves at most n times total, so the whole scan is linear.",
          },
          {
            type: "code",
            label: "Example — Two Sum II (sorted input)",
            code:
`function twoSumSorted(nums, target) {
  let low = 0, high = nums.length - 1;

  while (low < high) {
    const sum = nums[low] + nums[high];
    if (sum === target) return [low, high];
    if (sum < target) low++;   // need a bigger sum
    else high--;                // need a smaller sum
  }
  return [-1, -1];
}

// nums = [2, 7, 11, 15], target = 9
// low=0 (2), high=3 (15) -> sum 17, too big -> high--
// low=0 (2), high=2 (11) -> sum 13, too big -> high--
// low=0 (2), high=1 (7)  -> sum 9,  match -> return [0, 1]`,
          },
          {
            type: "p",
            text: "The same idea extends to 3Sum: fix one element, then run the two-pointer scan on the rest of the array for the remaining two. That turns an O(n³) brute force into O(n²) — sort once (O(n log n)), then loop i from 0 to n, and for each i do an O(n) two-pointer pass on the remainder.",
          },
          {
            type: "note",
            text: "Watch for duplicates in 3Sum/4Sum — after finding a valid triplet, skip over repeated values for both pointers before continuing, or you'll return the same triplet multiple times.",
          },
        ],
      },
      {
        id: "sliding-window",
        title: "Sliding Window",
        blocks: [
          {
            type: "p",
            text: "Sliding window applies when a problem asks about a contiguous subarray or substring under some constraint — 'longest substring without repeating characters', 'smallest subarray with sum ≥ target', 'longest subarray with at most K distinct elements'. The core idea: keep a window defined by [left, right], expand right to grow the window, and only shrink from left when the window breaks the constraint.",
          },
          {
            type: "p",
            text: "The reason this beats brute force isn't just 'fewer loops' — it's that each element enters the window exactly once (when right passes it) and leaves exactly once (when left passes it). That's what makes it O(n) instead of O(n²), even though it looks like there are two nested loops.",
          },
          {
            type: "code",
            label: "Example — Longest substring without repeating characters",
            code:
`function lengthOfLongestSubstring(s) {
  const seen = new Map();   // char -> last index seen
  let left = 0, best = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (seen.has(c) && seen.get(c) >= left) {
      // duplicate found inside the current window — jump left past it
      left = seen.get(c) + 1;
    }
    seen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}

// s = "abcabcbb"
// window grows a,b,c (best=3), hits second 'a' -> left jumps to 1
// continues b,c (best stays 3), hits second 'b' -> left jumps forward again
// final answer: 3 ("abc")`,
          },
          {
            type: "note",
            text: "A very common mistake: re-scanning the whole window every time it shrinks instead of adjusting left incrementally. That quietly turns your O(n) solution back into O(n²) — always shrink one step at a time, using data you're already tracking (a running sum, a frequency map, etc.), not a fresh scan.",
          },
        ],
      },
      {
        id: "recursion-backtracking",
        title: "Recursion & Backtracking",
        blocks: [
          {
            type: "p",
            text: "Every recursive function needs a base case — the condition where it stops calling itself and returns directly. Write that line before you write the recursive call. If you can't say out loud 'this stops when ___', you will write infinite recursion and blow the call stack.",
          },
          {
            type: "p",
            text: "Backtracking is recursion with a specific shape: choose an option, recurse into it as if it were final, then undo the choice before trying the next option. The 'undo' step is what actually makes it backtracking rather than a plain exhaustive DFS — skip it and your state leaks between branches.",
          },
          {
            type: "code",
            label: "Example — Generate all subsets (power set)",
            code:
`function subsets(nums) {
  const result = [];
  const current = [];

  function backtrack(start) {
    result.push([...current]);        // every state along the way is valid
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);          // choose
      backtrack(i + 1);               // recurse
      current.pop();                  // undo
    }
  }

  backtrack(0);
  return result;
}

// nums = [1, 2, 3]
// -> [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]`,
          },
          {
            type: "note",
            text: "If you can't trace what happens by hand for a tiny input (n = 3 or 4), you won't be able to debug it live under interview pressure either. Draw the recursion tree on paper first — two minutes there saves twenty minutes of confused staring later.",
          },
        ],
      },
      {
        id: "dynamic-programming",
        title: "Dynamic Programming",
        blocks: [
          {
            type: "p",
            text: "DP is just recursion where the same sub-problem gets asked more than once. Don't try to jump straight to a table — write the brute-force recursive solution first, notice which calls repeat, then cache the results (memoization). The bottom-up 'table' version is that same memoized recursion unrolled in order, starting from the base cases.",
          },
          {
            type: "p",
            text: "The hardest part isn't the code, it's identifying the state: whatever set of parameters change between recursive calls is your state, and that's what defines your table's dimensions. If your recursive function looks like solve(i, remainingCapacity), your DP table is 2D, indexed by i and remainingCapacity. Figure out the state before worrying about the table shape.",
          },
          {
            type: "code",
            label: "Example — Climbing Stairs (1D DP)",
            code:
`// You can climb 1 or 2 steps at a time. How many distinct ways to reach step n?

// Brute force recursion — exponential, recomputes the same i many times:
function climb(i, n) {
  if (i > n) return 0;
  if (i === n) return 1;
  return climb(i + 1, n) + climb(i + 2, n);
}

// Bottom-up DP — O(n) time, O(1) space once you notice you only need the
// last two values:
function climbStairs(n) {
  let prev2 = 1, prev1 = 1;   // ways(0) = 1, ways(1) = 1
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2;   // ways(i) = ways(i-1) + ways(i-2)
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}`,
          },
          {
            type: "note",
            text: "Climbing stairs, house robber, and longest increasing subsequence all feel 'too simple to be real DP' — get comfortable with 1D DP here before jumping to 2D grid problems or knapsack. The transition (the recurrence relation) is the whole trick; everything else is bookkeeping.",
          },
        ],
      },
      {
        id: "graphs-bfs-dfs",
        title: "Graphs — BFS vs DFS",
        blocks: [
          {
            type: "p",
            text: "Reach for BFS when the problem is about unweighted shortest distance or 'minimum number of steps' — BFS explores the graph level by level, so the very first time it reaches the target node, that's guaranteed to be via the shortest path. Reach for DFS when you need to explore every possibility, check if any path exists, or do something like detect a cycle or count connected components.",
          },
          {
            type: "p",
            text: "Trees have no cycles, so a plain recursive DFS is safe without extra bookkeeping. Graphs can have cycles, so you must track visited nodes — skipping that is the single most common cause of an infinite loop or stack overflow in graph problems.",
          },
          {
            type: "code",
            label: "Example — Number of Islands (grid DFS)",
            code:
`function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let count = 0;

  function sink(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return;
    if (grid[r][c] !== "1") return;
    grid[r][c] = "0";       // mark visited by sinking the land
    sink(r + 1, c);
    sink(r - 1, c);
    sink(r, c + 1);
    sink(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        count++;
        sink(r, c);          // erase this whole island so we don't recount it
      }
    }
  }
  return count;
}`,
          },
          {
            type: "note",
            text: "For shortest path on a weighted graph, neither plain BFS nor DFS is correct — that's Dijkstra's (non-negative weights) or Bellman-Ford (handles negative weights). BFS shortest-path only works because every edge in an unweighted graph effectively has weight 1.",
          },
        ],
      },
    ],
  },
  {
    id: "oop",
    subject: "Object-Oriented Programming",
    topics: [
      {
        id: "four-pillars",
        title: "The Four Pillars",
        blocks: [
          {
            type: "p",
            text: "Encapsulation bundles data with the methods that operate on it, and hides the internal state behind a controlled interface. The point isn't just 'make fields private' — it's limiting how an object's state can be changed, so invalid states become hard to create by accident.",
          },
          {
            type: "p",
            text: "Abstraction exposes what an object does without exposing how it does it — interfaces and abstract classes are the tools. It's easy to confuse with encapsulation: encapsulation hides data, abstraction hides complexity/implementation detail.",
          },
          {
            type: "p",
            text: "Inheritance models an 'is-a' relationship (a Dog is an Animal) and lets a subclass reuse and extend a parent's behavior. Polymorphism means the same method call behaves differently depending on the actual runtime type of the object — a shape.area() call does something different for a Circle than a Square, without the caller needing to know which one it has.",
          },
          {
            type: "code",
            label: "Example — polymorphism through method overriding",
            code:
`class Shape {
  area() { throw new Error("not implemented"); }
}

class Circle extends Shape {
  constructor(r) { super(); this.r = r; }
  area() { return Math.PI * this.r ** 2; }
}

class Square extends Shape {
  constructor(side) { super(); this.side = side; }
  area() { return this.side ** 2; }
}

function totalArea(shapes) {
  // caller doesn't care which concrete Shape it has — that's polymorphism
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}

totalArea([new Circle(2), new Square(3)]); // -> 12.566... + 9`,
          },
        ],
      },
      {
        id: "solid",
        title: "SOLID Principles",
        blocks: [
          {
            type: "ul",
            items: [
              "Single Responsibility — a class should have exactly one reason to change. If you can describe a class with 'and', it's probably doing two jobs.",
              "Open/Closed — code should be open to extension but closed to modification. Add new behavior by adding new code (a new subclass, a new strategy), not by editing existing, working code.",
              "Liskov Substitution — a subclass should be usable anywhere its parent is expected, without breaking the caller's assumptions. Classic violation: a Square extending Rectangle that overrides setWidth to also change height — it looks fine until code that assumes independent width/height breaks.",
              "Interface Segregation — many small, focused interfaces beat one large interface that forces classes to implement methods they don't need.",
              "Dependency Inversion — depend on abstractions (interfaces), not concrete implementations. High-level modules shouldn't need to know the details of low-level modules.",
            ],
          },
          {
            type: "note",
            text: "Interviewers rarely ask you to recite the definitions — they show you a small code snippet and ask 'what's wrong with this design?'. Practice spotting violations, not memorizing the acronym.",
          },
        ],
      },
      {
        id: "composition-vs-inheritance",
        title: "Composition vs Inheritance",
        blocks: [
          {
            type: "p",
            text: "Inheritance models 'is-a'; composition models 'has-a' (a Car has an Engine, rather than a Car being a kind of Engine). The classic trap with inheritance is a deep, rigid hierarchy that breaks the moment reality doesn't fit a clean tree — e.g. a Penguin is-a Bird, but Bird.fly() doesn't apply to it.",
          },
          {
            type: "code",
            label: "Example — the same feature, built two ways",
            code:
`// Inheritance: forces every Bird subclass to inherit fly(), even Penguin
class Bird {
  fly() { return "flying"; }
}
class Penguin extends Bird {
  fly() { throw new Error("penguins can't fly"); } // awkward override
}

// Composition: only birds that CAN fly get a flying behavior injected
class Bird {
  constructor(flyBehavior) { this.flyBehavior = flyBehavior; }
  fly() { return this.flyBehavior ? this.flyBehavior() : "can't fly"; }
}
const eagle = new Bird(() => "soaring");
const penguin = new Bird(null);`,
          },
          {
            type: "note",
            text: "Rule of thumb when you're unsure which to reach for in an interview: default to composition. It's more flexible and doesn't lock you into a hierarchy you'll regret three requirements later.",
          },
        ],
      },
    ],
  },
  {
    id: "dbms",
    subject: "DBMS",
    topics: [
      {
        id: "normalization",
        title: "Normalization",
        blocks: [
          {
            type: "p",
            text: "Normalization is about removing redundancy so an update doesn't require changing the same fact in multiple places. 1NF requires atomic columns (no comma-separated lists in a cell) and no repeating groups. 2NF requires 1NF plus no partial dependency — every non-key column must depend on the whole composite primary key, not just part of it. 3NF requires 2NF plus no transitive dependency — a non-key column can't depend on another non-key column.",
          },
          {
            type: "example",
            text: "A table Orders(order_id, customer_id, customer_name, customer_email) violates 3NF: customer_name and customer_email depend on customer_id, not directly on order_id — that's a transitive dependency. Fix: split into Orders(order_id, customer_id) and Customers(customer_id, customer_name, customer_email). Now a customer's email changes in exactly one row, not once per order.",
          },
          {
            type: "note",
            text: "Interviewers usually care that you understand why normalization matters (data integrity, less redundancy) more than reciting NF definitions verbatim — and that you know when to denormalize deliberately for read performance.",
          },
        ],
      },
      {
        id: "acid",
        title: "ACID & Transactions",
        blocks: [
          {
            type: "ul",
            items: [
              "Atomicity — a transaction is all-or-nothing. If any part fails, the whole thing rolls back as if it never happened.",
              "Consistency — a transaction takes the database from one valid state to another, respecting constraints, triggers, and rules.",
              "Isolation — concurrent transactions don't see each other's uncommitted, half-finished work. The isolation level (read committed, repeatable read, serializable) controls exactly how strict this is.",
              "Durability — once a transaction commits, it survives a crash — the change is written somewhere that outlives a power failure.",
            ],
          },
          {
            type: "example",
            text: "Classic example: transferring money between two bank accounts. debit(A, 100) then credit(B, 100) must happen together. If the process crashes after the debit but before the credit, atomicity guarantees the whole transaction rolls back — A never loses the 100 with nowhere for it to go.",
          },
        ],
      },
      {
        id: "indexing",
        title: "Indexing",
        blocks: [
          {
            type: "p",
            text: "An index is a separate data structure (usually a B-tree) that lets the database find rows without scanning the whole table. It speeds up reads dramatically but slows down writes, because every INSERT/UPDATE/DELETE also has to update the index. Don't index columns you rarely filter, join, or sort on — you're paying a write cost for a read benefit you're not using.",
          },
          {
            type: "p",
            text: "A clustered index physically orders the table's rows on disk according to the index key — a table can have only one, because rows can only be physically sorted one way. A non-clustered index is a separate structure that stores the key plus a pointer back to the actual row — a table can have many of these.",
          },
          {
            type: "code",
            label: "Example",
            code:
`-- Without an index, this scans every row in a million-row table:
SELECT * FROM orders WHERE customer_id = 4821;

-- Adding an index lets the database jump straight to matching rows:
CREATE INDEX idx_orders_customer_id ON orders(customer_id);`,
          },
        ],
      },
      {
        id: "joins",
        title: "Joins",
        blocks: [
          {
            type: "p",
            text: "INNER JOIN returns only rows that have a match in both tables. LEFT JOIN returns everything from the left table, plus matches from the right where they exist — NULLs fill in where there's no match. Most interview questions are really just testing whether you know when a row disappears (INNER) versus when it shows up with NULLs (LEFT).",
          },
          {
            type: "code",
            label: "Example",
            code:
`-- users: id, name          orders: id, user_id, amount
-- Alice (1) has 2 orders. Bob (2) has none.

SELECT users.name, orders.amount
FROM users
LEFT JOIN orders ON users.id = orders.user_id;

-- Alice | 50
-- Alice | 20
-- Bob   | NULL     <- Bob still appears, with NULL for the order columns

-- Same query with INNER JOIN instead of LEFT JOIN would simply drop Bob's row.`,
          },
        ],
      },
    ],
  },
  {
    id: "os",
    subject: "Operating Systems",
    topics: [
      {
        id: "process-vs-thread",
        title: "Process vs Thread",
        blocks: [
          {
            type: "p",
            text: "A process has its own isolated memory space (code, data, heap, stack) — one process can't directly read another's memory. Threads live inside a process and share that process's memory, including the heap and global variables, but each thread keeps its own stack and program counter.",
          },
          {
            type: "p",
            text: "This is exactly why threads are cheaper to create and switch between (no need to set up a new address space), but also why they need explicit synchronization (locks, mutexes, semaphores) — two threads writing to the same shared variable at the same time is a race condition, something that simply can't happen between two separate processes without deliberate IPC.",
          },
          {
            type: "note",
            text: "Multiprocessing gives you fault isolation (one process crashing doesn't take down another) at the cost of heavier context switches and needing IPC (pipes, sockets, shared memory) to communicate. Multithreading gives you cheap communication (shared memory) at the cost of one bad thread being able to corrupt the whole process.",
          },
        ],
      },
      {
        id: "deadlocks",
        title: "Deadlocks",
        blocks: [
          {
            type: "p",
            text: "A deadlock happens when a set of processes are each waiting on a resource held by another process in the same set, and none of them can proceed. Four conditions must all hold simultaneously for deadlock to be possible: mutual exclusion (a resource can only be held by one process at a time), hold and wait (a process holds a resource while waiting for another), no preemption (a resource can't be forcibly taken away), and circular wait (a cycle of processes each waiting on the next).",
          },
          {
            type: "example",
            text: "Process A holds Lock 1 and waits for Lock 2. Process B holds Lock 2 and waits for Lock 1. Neither can ever proceed — that circular wait is a deadlock. Breaking it: enforce a global lock ordering (always acquire Lock 1 before Lock 2, in every code path), which eliminates circular wait entirely.",
          },
          {
            type: "note",
            text: "Since all four conditions are required, breaking any single one prevents deadlock — that's the basis of every prevention strategy. Lock ordering breaks circular wait; timeouts + rollback break hold-and-wait; the Banker's Algorithm avoids unsafe resource allocation states altogether.",
          },
        ],
      },
      {
        id: "cpu-scheduling",
        title: "CPU Scheduling",
        blocks: [
          {
            type: "ul",
            items: [
              "FCFS (First Come First Serve) — simple, but a long process at the front makes everyone behind it wait (the 'convoy effect'), giving poor average wait time.",
              "SJF (Shortest Job First) — provably optimal average wait time, but requires knowing burst time in advance, which is rarely realistic.",
              "Round Robin — each process gets a fixed time quantum before being preempted; fair and great for time-sharing/interactive systems, but performance is sensitive to how the quantum is tuned.",
              "Priority Scheduling — runs the highest-priority process first; can starve low-priority processes indefinitely unless you add aging (gradually increasing the priority of processes that have waited a long time).",
            ],
          },
          {
            type: "example",
            text: "Round Robin with quantum = 2 and processes P1(burst 5), P2(burst 3), P3(burst 1): order of execution is P1(2), P2(2), P3(1, finishes), P1(2), P2(1, finishes), P1(1, finishes). P3 finishes fastest despite arriving last, because Round Robin doesn't let any single process monopolize the CPU.",
          },
        ],
      },
      {
        id: "paging-vs-segmentation",
        title: "Paging vs Segmentation",
        blocks: [
          {
            type: "p",
            text: "Paging splits both physical and logical memory into fixed-size blocks (pages/frames). It's simple to manage and avoids external fragmentation (leftover unusable gaps between allocations), but can waste some memory inside the last page of an allocation (internal fragmentation).",
          },
          {
            type: "p",
            text: "Segmentation splits memory into variable-size logical units that match how a programmer actually thinks about a program — a code segment, a stack segment, a heap segment. It matches program structure more naturally, but because segments are variable-sized, memory can fragment externally as segments are allocated and freed.",
          },
          {
            type: "note",
            text: "Most real systems (like x86) combine both: segmentation for logical organization, paging underneath for physical memory management.",
          },
        ],
      },
    ],
  },
  {
    id: "cn",
    subject: "Computer Networks",
    topics: [
      {
        id: "tcp-vs-udp",
        title: "TCP vs UDP",
        blocks: [
          {
            type: "p",
            text: "TCP is connection-oriented: before any data flows, both sides perform a three-way handshake, and TCP guarantees delivery, ordering, and retransmits lost packets. That reliability costs latency and overhead. UDP is connectionless — no handshake, no delivery guarantee, no ordering — it's just 'send it and hope'. That makes it faster and lower-overhead, which is exactly why it's used where a dropped packet matters less than speed: video calls, live streaming, DNS lookups, online gaming.",
          },
          {
            type: "code",
            label: "Example — TCP three-way handshake",
            code:
`Client -> Server : SYN (seq = x)
Server -> Client : SYN-ACK (seq = y, ack = x + 1)
Client -> Server : ACK (ack = y + 1)

-- After this, both sides have confirmed they can send AND receive.
-- Only then does actual data start flowing.`,
          },
        ],
      },
      {
        id: "osi-model",
        title: "OSI Model",
        blocks: [
          {
            type: "ul",
            items: [
              "Physical — raw bits over a medium (cables, radio signals).",
              "Data Link — frames, MAC addresses, switches operate here.",
              "Network — packets, IP addresses, routing — routers operate here.",
              "Transport — TCP/UDP, ports, reliability and ordering.",
              "Session — establishing/managing/tearing down sessions between applications.",
              "Presentation — data format translation, encryption, compression.",
              "Application — the protocols apps actually talk: HTTP, FTP, SMTP, DNS.",
            ],
          },
          {
            type: "note",
            text: "Know the full seven layers, but expect interview depth mostly on Transport (TCP vs UDP) and Application (HTTP, DNS) — those are the ones that come up in follow-up questions, not just 'name the layers'.",
          },
        ],
      },
      {
        id: "http-vs-https",
        title: "HTTP vs HTTPS",
        blocks: [
          {
            type: "p",
            text: "HTTPS is HTTP layered on top of TLS — same request/response protocol underneath, but the connection is encrypted in transit and the server's identity is verified via a certificate signed by a trusted Certificate Authority. That's what stops someone on the same network from reading your traffic or impersonating the server.",
          },
          {
            type: "p",
            text: "The cost is the TLS handshake — extra round trips before the first byte of actual data flows. This is exactly why connection reuse (keep-alive), TLS session resumption, and HTTP/2 multiplexing exist: to amortize that handshake cost across many requests instead of paying it every time.",
          },
        ],
      },
      {
        id: "dns-resolution",
        title: "DNS Resolution",
        blocks: [
          {
            type: "p",
            text: "Resolving a domain name to an IP address goes through a chain of caches and servers, checked in order until one has the answer: browser cache, OS cache, the recursive resolver (usually your ISP or a public one like 8.8.8.8), a root server, a TLD server (.com, .org, etc.), and finally the domain's authoritative name server.",
          },
          {
            type: "example",
            text: "Resolving www.example.com the very first time might touch all six steps. Every subsequent visit within the DNS record's TTL is answered straight from the browser or OS cache — which is why most real-world DNS lookups never leave the first two steps.",
          },
        ],
      },
    ],
  },
  {
    id: "aptitude",
    subject: "Aptitude & Reasoning",
    topics: [
      {
        id: "percentages",
        title: "Percentages",
        blocks: [
          {
            type: "p",
            text: "A percent increase of x% followed by a percent decrease of x% never returns you to the original value — it's always net negative, by exactly x²/100 percent of the original. This comes up constantly disguised as 'price increased then decreased by the same %' questions.",
          },
          {
            type: "example",
            text: "Price starts at 100. Increase by 20% -> 120. Decrease by 20% -> 120 × 0.8 = 96, not 100. The shortfall is 4, and x²/100 = 20²/100 = 4 — matches exactly. Memorize the formula instead of recalculating from scratch every time it appears.",
          },
        ],
      },
      {
        id: "time-speed-distance",
        title: "Time, Speed & Distance",
        blocks: [
          {
            type: "p",
            text: "Almost every 'two trains' or 'two people walking' question reduces to relative speed: add the speeds if the two objects move toward each other or in opposite directions, subtract them if they move in the same direction. Once you have relative speed, distance = relative speed × time, same as any single-object problem.",
          },
          {
            type: "example",
            text: "Two trains, 60 km apart, moving toward each other at 40 km/h and 20 km/h. Relative speed = 60 km/h. Time to meet = distance / relative speed = 60/60 = 1 hour.",
          },
        ],
      },
      {
        id: "permutations-combinations",
        title: "Permutations vs Combinations",
        blocks: [
          {
            type: "p",
            text: "If order matters, it's a permutation (nPr = n! / (n-r)!). If order doesn't matter, it's a combination (nCr = n! / (r!(n-r)!)). When you're not sure which applies, ask: would swapping two selected items produce a different valid answer? If yes, it's a permutation; if the result is considered the same either way, it's a combination.",
          },
          {
            type: "example",
            text: "Choosing 3 people out of 10 for a committee: order doesn't matter -> combination, 10C3 = 120. Choosing a president, vice-president, and treasurer from 10 people: order matters (who gets which role) -> permutation, 10P3 = 720.",
          },
        ],
      },
    ],
  },
  {
    id: "system-design",
    subject: "System Design Basics",
    topics: [
      {
        id: "gathering-requirements",
        title: "Start With Requirements",
        blocks: [
          {
            type: "p",
            text: "Before drawing any boxes or arrows, nail down the numbers: how many users, how many requests per second, is it read-heavy or write-heavy, how much data are we storing, and what's the acceptable latency. The architecture should fall out of these numbers — guessing at a design first and backfilling the requirements just means redoing the design later.",
          },
          {
            type: "example",
            text: "Designing a URL shortener: 100M new URLs/month (~40 writes/sec), 100:1 read:write ratio (~4,000 reads/sec), each record maybe 500 bytes (~50GB over 5 years). Those numbers alone tell you: this is read-heavy (cache aggressively), the write volume is modest (a single well-indexed DB can likely handle it), and total storage is small enough that sharding isn't an early concern.",
          },
        ],
      },
      {
        id: "caching-strategies",
        title: "Caching Strategies",
        blocks: [
          {
            type: "p",
            text: "Put a cache in front of anything that's read far more often than it's written — the URL shortener's redirect lookup is a perfect example. Cache-aside is the most common pattern: check the cache first; on a miss, read from the database, then populate the cache for next time.",
          },
          {
            type: "code",
            label: "Example — cache-aside pattern",
            code:
`function getUrl(shortCode) {
  let longUrl = cache.get(shortCode);
  if (longUrl) return longUrl;           // cache hit

  longUrl = database.query(shortCode);    // cache miss
  cache.set(shortCode, longUrl, { ttl: 3600 });
  return longUrl;
}`,
          },
          {
            type: "note",
            text: "Also queue anything that doesn't need to happen synchronously in the request path — sending a confirmation email, logging an analytics event. Let the user's request finish fast, and let a worker process the queue in the background.",
          },
        ],
      },
      {
        id: "cap-theorem",
        title: "CAP Theorem",
        blocks: [
          {
            type: "p",
            text: "CAP says a distributed system can only fully guarantee two of Consistency (every read gets the latest write), Availability (every request gets a response, even if it's not the latest data), and Partition tolerance (the system keeps working even if network communication between nodes breaks). Since network partitions are a fact of life in any real distributed system, partition tolerance isn't really optional — the real choice in practice is between consistency and availability when a partition happens.",
          },
          {
            type: "note",
            text: "State it as a trade-off, not a rule to recite: a banking ledger leans CP (would rather reject a request than show stale balance data), a social media like-count leans AP (would rather show a slightly stale count than go down entirely).",
          },
        ],
      },
    ],
  },
  {
    id: "hr",
    subject: "HR / Behavioral",
    topics: [
      {
        id: "star-method",
        title: "The STAR Method",
        blocks: [
          {
            type: "p",
            text: "Situation, Task, Action, Result. Use it as a checklist to make sure you haven't skipped a piece of the story — not as a rigid script to recite word for word. The interviewer wants to hear how you think and what you actually did, not a memorized paragraph.",
          },
          {
            type: "example",
            text: "Situation: 'Our team's deploy pipeline was breaking randomly, costing us about an hour a day debugging it.' Task: 'I was asked to figure out the root cause since I'd touched that part of the infra before.' Action: 'I added logging around the flaky step, found it was a race condition in a caching layer, and fixed it by adding a lock around the write.' Result: 'Deploy failures dropped from daily to about once a month, and I wrote up the fix so the rest of the team could recognize the pattern if it showed up elsewhere.'",
          },
        ],
      },
      {
        id: "tell-me-about-yourself",
        title: "'Tell Me About Yourself'",
        blocks: [
          {
            type: "p",
            text: "Don't recite your resume top to bottom — the interviewer already has it. Instead, pick a thread: the kind of problems you enjoy solving, or how your experience led you to want this specific role, and tell it as a short narrative in under 90 seconds. This is the question everyone underestimates because it feels easy — practice it out loud, not just in your head.",
          },
          {
            type: "note",
            text: "A useful structure: where you are now (1 sentence), how you got here (2-3 sentences hitting the relevant highlights), why you're interested in this role specifically (1-2 sentences). End on the future, not the past.",
          },
        ],
      },
      {
        id: "common-traps",
        title: "Common Traps",
        blocks: [
          {
            type: "ul",
            items: [
              "'What's your greatest weakness?' — pick something real, not a disguised strength ('I work too hard'). Say what you're doing about it — the growth matters more than the weakness itself.",
              "'Why are you leaving your current job?' — stay forward-looking and factual. Never trash a previous employer, even if it's justified; it reads as a risk signal, not sympathy.",
              "'Where do you see yourself in 5 years?' — the honest goal here is showing you've thought about growth and that it's plausible within this company, not predicting your exact job title.",
            ],
          },
          {
            type: "note",
            text: "Prepare 3-4 solid stories (a conflict, a failure, a time you led something, a time you were wrong) and practice angling each one toward whatever's actually being asked, instead of writing a unique answer for every possible question you might get.",
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Block renderer
// ---------------------------------------------------------------------------

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

  if (block.type === "example") {
    return (
      <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-900/10 p-4 flex flex-col gap-1.5">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Example
        </p>
        <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed">
          {block.text}
        </p>
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

export default function NotesPage() {
  const [activeId, setActiveId] = useState(subjects[0].topics[0].id);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    const headings = subjects.flatMap((s) => s.topics.map((t) => t.id));

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
          Notes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Detailed revision notes with worked examples, organized by subject
          and topic — the same way the question bank is.
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
            {subjects.map((s) => (
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
            {subjects.map((s) => (
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
          {subjects.map((s) => (
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
