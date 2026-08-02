// InterviewExperiencesPage.jsx — Resources > Interview Experiences. Round-by-round
// breakdowns of how the interview process typically plays out at top companies,
// so users know what to expect before walking in. Login-gated in App.jsx via
// ProtectedRoute — signed-out visitors are redirected to /login before they
// ever reach this component.

import { useMemo, useState } from "react";
import { Search, X, Clock, CheckCircle2, Lightbulb, ChevronDown } from "lucide-react";

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const ALL = "All";
const DIFFICULTIES = ["All", "Easy", "Moderate", "Hard"];

const companies = [
  {
    id: "google",
    name: "Google",
    initials: "G",
    color: "bg-blue-500",
    role: "Software Engineer, New Grad",
    difficulty: "Hard",
    verdict: "Selected",
    tags: ["DSA", "System Design", "Googleyness"],
    summary:
      "Heavy DSA bar across every technical round — interviewers care more about how you arrive at an optimal solution out loud than whether you type it perfectly the first try.",
    rounds: [
      {
        title: "Online Assessment",
        format: "Online · 90 min",
        focus: "2 DSA problems (medium-hard) auto-graded on correctness and complexity.",
        topics: ["Arrays & Hashing", "Graphs", "Dynamic Programming"],
        tip: "Submissions are checked against hidden edge cases and time limits — don't stop at the first passing sample.",
      },
      {
        title: "Technical Phone Screen",
        format: "Virtual · 45 min",
        focus: "One live coding problem in a shared doc, no IDE support.",
        topics: ["Trees", "Sliding Window"],
        tip: "Talk through your approach before writing a single line — the interviewer is grading your reasoning as much as the code.",
      },
      {
        title: "Onsite Round 1 & 2 — Coding",
        format: "Virtual · 45 min each",
        focus: "Two back-to-back DSA rounds, each with 1-2 problems that build on each other.",
        topics: ["Graphs (BFS/DFS)", "Heaps", "Backtracking"],
        tip: "Interviewers often add a follow-up constraint mid-round ('now do it in O(1) space') — expect the problem to evolve live.",
      },
      {
        title: "Onsite Round 3 — Googleyness & Leadership",
        format: "Virtual · 45 min",
        focus: "Behavioral round on collaboration, ambiguity, and conflict resolution.",
        topics: ["STAR-format stories", "Ownership", "Dealing with ambiguity"],
        tip: "Have 3-4 concrete stories ready — this round has failed strong coders who treated it as a formality.",
      },
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    initials: "M",
    color: "bg-sky-600",
    role: "SDE-1",
    difficulty: "Hard",
    verdict: "Selected",
    tags: ["DSA", "OOD", "CS Fundamentals"],
    summary:
      "Slightly more conversational than Google's bar, but CS fundamentals (OS, DBMS, OOP) come up as follow-up questions inside coding rounds, not as separate rounds.",
    rounds: [
      {
        title: "Online Assessment",
        format: "Online · 2 hrs",
        focus: "2 coding problems + 20 MCQs on CS fundamentals and aptitude.",
        topics: ["Arrays", "Strings", "OS basics", "DBMS basics"],
        tip: "MCQ section is time-boxed separately from coding — don't let one section eat the other's clock.",
      },
      {
        title: "Technical Round 1",
        format: "Virtual · 60 min",
        focus: "One DSA problem plus a design-a-class OOD exercise.",
        topics: ["Linked Lists", "OOP design"],
        tip: "They want to see you ask clarifying questions before coding — jumping straight in reads as a red flag here.",
      },
      {
        title: "Technical Round 2",
        format: "Virtual · 60 min",
        focus: "Medium-hard DSA problem, then a deep dive into your resume project.",
        topics: ["Dynamic Programming", "Project internals"],
        tip: "Know the trade-offs behind every technical decision in your listed projects — 'why not X instead' is a guaranteed question.",
      },
      {
        title: "Hiring Manager / 'As Appropriate' Round",
        format: "Virtual · 45 min",
        focus: "Behavioral + culture fit, sometimes with a light system design sketch.",
        topics: ["Behavioral", "Basic system design"],
        tip: "This round can flip a borderline decision either way — treat it with the same prep as the coding rounds.",
      },
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    initials: "A",
    color: "bg-orange-500",
    role: "SDE-1",
    difficulty: "Hard",
    verdict: "Selected",
    tags: ["DSA", "Leadership Principles", "System Design"],
    summary:
      "Every single round — including the coding ones — ends with Leadership Principle questions. Candidates with clean code but weak LP stories get rejected here more than anywhere else.",
    rounds: [
      {
        title: "Online Assessment",
        format: "Online · 2 hrs",
        focus: "2 DSA problems + a work-style/behavioral simulation section.",
        topics: ["Arrays", "Trees", "Simulation-based judgment questions"],
        tip: "The work-style section is scored too — answer as your genuine self, not what you think sounds impressive.",
      },
      {
        title: "Technical Round 1",
        format: "Virtual · 60 min",
        focus: "1-2 DSA problems, then 2 Leadership Principle stories.",
        topics: ["Two Pointers", "Bit Manipulation", "Ownership", "Bias for Action"],
        tip: "Structure every LP answer as Situation-Task-Action-Result with a measurable Result — vague answers get probed hard.",
      },
      {
        title: "Technical Round 2",
        format: "Virtual · 60 min",
        focus: "Harder DSA problem plus a light system design (design a URL shortener / rate limiter style).",
        topics: ["Graphs", "System Design basics", "Customer Obsession"],
        tip: "Narrate your assumptions on the design question out loud — Amazon wants to see the requirements-gathering step, not just a final diagram.",
      },
      {
        title: "Bar Raiser Round",
        format: "Virtual · 60 min",
        focus: "An interviewer from outside the hiring team, focused entirely on Leadership Principles with deep follow-ups.",
        topics: ["Deep-dive LP stories", "Conflict & failure stories"],
        tip: "The Bar Raiser exists to catch inflated stories — expect 'what would you do differently' on every answer you give.",
      },
    ],
  },
  {
    id: "meta",
    name: "Meta",
    initials: "M",
    color: "bg-indigo-600",
    role: "Software Engineer",
    difficulty: "Hard",
    verdict: "Selected",
    tags: ["DSA", "System Design", "Behavioral"],
    summary:
      "Extremely fast-paced coding rounds — two problems in 45 minutes is the norm, so speed and clean implementation matter as much as the right approach.",
    rounds: [
      {
        title: "Technical Phone Screen",
        format: "Virtual · 45 min",
        focus: "2 DSA problems, expected to be coded and fully working within the slot.",
        topics: ["Arrays & Hashing", "Trees"],
        tip: "Practice typing out clean solutions fast — this round is graded partly on how much you complete, not just correctness.",
      },
      {
        title: "Onsite — Coding Round 1 & 2",
        format: "Virtual · 45 min each",
        focus: "2 problems per round, ramping from medium to hard.",
        topics: ["Graphs", "Dynamic Programming", "Intervals"],
        tip: "State time/space complexity unprompted after each solution — Meta interviewers expect it without being asked.",
      },
      {
        title: "System Design",
        format: "Virtual · 45 min",
        focus: "Design a product-facing system (e.g. News Feed ranking, a chat app) end to end.",
        topics: ["Scalability", "Data modeling", "API design"],
        tip: "Anchor the whole round around numbers — throughput, storage, and latency targets — before drawing any boxes.",
      },
      {
        title: "Behavioral",
        format: "Virtual · 45 min",
        focus: "Focused on Meta's core values: moving fast, being direct, and impact.",
        topics: ["Conflict resolution", "Ambiguity", "Cross-team collaboration"],
        tip: "Bias toward stories where you drove a decision under incomplete information — that's what this round is really probing for.",
      },
    ],
  },
  {
    id: "apple",
    name: "Apple",
    initials: "A",
    color: "bg-slate-700",
    role: "Software Engineer",
    difficulty: "Hard",
    verdict: "Selected",
    tags: ["DSA", "Domain Depth", "System Design"],
    summary:
      "Team-specific — the exact round structure depends on which org you're interviewing with, but every loop tests real depth in your stated area rather than generic DSA breadth.",
    rounds: [
      {
        title: "Recruiter + Hiring Manager Screen",
        format: "Virtual · 30 min",
        focus: "Background, project depth, and role fit before any technical rounds begin.",
        topics: ["Resume deep dive", "Role expectations"],
        tip: "Be ready to explain the hardest bug you've ever fixed in concrete detail — this comes up almost every time.",
      },
      {
        title: "Technical Round 1",
        format: "Virtual · 60 min",
        focus: "DSA problem plus questions specific to your claimed domain (mobile, backend, infra).",
        topics: ["Data Structures", "Domain-specific fundamentals"],
        tip: "Don't list a skill on your resume you can't defend under direct questioning — Apple interviewers probe resume claims hard.",
      },
      {
        title: "Technical Round 2 — System/Component Design",
        format: "Virtual · 60 min",
        focus: "Design a component relevant to the team (e.g. an offline-sync layer, a caching system).",
        topics: ["System Design", "Trade-off discussions"],
        tip: "Apple cares about polish and edge cases more than raw scale numbers — think about failure modes, not just throughput.",
      },
      {
        title: "Final Loop (Onsite)",
        format: "Virtual/Onsite · 3-4 back-to-back rounds",
        focus: "Mix of coding, design, and a values/culture conversation with team members.",
        topics: ["Coding", "Design", "Team fit"],
        tip: "Ask each interviewer what they're actually working on — genuine curiosity about the team's real problems stands out here.",
      },
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    initials: "N",
    color: "bg-red-600",
    role: "Senior Software Engineer",
    difficulty: "Hard",
    verdict: "Rejected — Final Round",
    tags: ["System Design", "Seniority Signals", "Culture Fit"],
    summary:
      "Very little algorithmic grinding — the bar is almost entirely about seniority signals: past impact, technical judgment, and how you operate with high autonomy.",
    rounds: [
      {
        title: "Recruiter Screen",
        format: "Virtual · 30 min",
        focus: "Career narrative and why Netflix specifically, given their unusually direct culture.",
        topics: ["Career trajectory", "Culture alignment"],
        tip: "Read Netflix's culture memo beforehand — interviewers reference it directly and expect you to have real opinions on it.",
      },
      {
        title: "Technical Deep Dive",
        format: "Virtual · 60 min",
        focus: "Walkthrough of a system you built end-to-end, with heavy 'why' follow-ups.",
        topics: ["Architecture decisions", "Trade-offs", "Failure handling"],
        tip: "Pick a project where something actually went wrong and you fixed it — a clean success story invites fewer good follow-ups.",
      },
      {
        title: "System Design",
        format: "Virtual · 60 min",
        focus: "Design a large-scale streaming-adjacent system (e.g. a recommendation pipeline).",
        topics: ["Distributed systems", "Data pipelines", "Scalability"],
        tip: "Justify every component choice against a real constraint (cost, latency, consistency) — 'because it's standard' isn't accepted here.",
      },
      {
        title: "Final Panel",
        format: "Virtual · 4x45 min",
        focus: "Multiple senior engineers/managers probing judgment, autonomy, and past decisions under ambiguity.",
        topics: ["Judgment calls", "Ownership", "Freedom & Responsibility culture fit"],
        tip: "My gap: I under-sold a decision I'd reversed mid-project. Frame reversals as good judgment, not indecision — own the 'why I changed course' clearly.",
      },
    ],
  },
  {
    id: "adobe",
    name: "Adobe",
    initials: "A",
    color: "bg-rose-600",
    role: "Member of Technical Staff",
    difficulty: "Moderate",
    verdict: "Selected",
    tags: ["DSA", "CS Fundamentals", "Puzzles"],
    summary:
      "Well-structured, predictable loop — strong on core CS fundamentals (OOP, DBMS, OS) alongside DSA, occasionally with a logic puzzle thrown in.",
    rounds: [
      {
        title: "Online Assessment",
        format: "Online · 90 min",
        focus: "2 DSA problems + MCQs on OOP, DBMS, and OS.",
        topics: ["Recursion", "SQL joins", "Process vs Thread"],
        tip: "The MCQ section carries real weight here — don't treat it as a formality before the coding questions.",
      },
      {
        title: "Technical Round 1",
        format: "Virtual · 45 min",
        focus: "1-2 DSA problems with a focus on clean, bug-free code.",
        topics: ["Strings", "Arrays", "Hashing"],
        tip: "Dry-run your solution against a tricky edge case out loud before declaring it done — Adobe interviewers actively wait for this.",
      },
      {
        title: "Technical Round 2",
        format: "Virtual · 45 min",
        focus: "Core CS fundamentals discussion plus a project deep-dive.",
        topics: ["DBMS normalization", "OOP design principles", "Project architecture"],
        tip: "Be ready to design a small schema on the spot and justify your normalization choices.",
      },
      {
        title: "HR Round",
        format: "Virtual · 30 min",
        focus: "Standard behavioral round — strengths, weaknesses, and long-term goals.",
        topics: ["Behavioral", "Compensation expectations"],
        tip: "Keep answers concise and specific — this round moves fast and rewards clarity over length.",
      },
    ],
  },
  {
    id: "uber",
    name: "Uber",
    initials: "U",
    color: "bg-black",
    role: "Software Engineer II",
    difficulty: "Hard",
    verdict: "Selected",
    tags: ["DSA", "System Design", "Values"],
    summary:
      "Fast, no-nonsense process — typically wraps up in under two weeks. Coding rounds lean toward real-world-flavored problems (rate limiters, matching logic) over pure LeetCode abstractions.",
    rounds: [
      {
        title: "Technical Phone Screen",
        format: "Virtual · 60 min",
        focus: "One medium-hard DSA problem with an emphasis on production-quality code.",
        topics: ["Hash Maps", "Simulation-style problems"],
        tip: "Write code as if it'll be reviewed by a teammate — meaningful variable names and small helper functions score points here.",
      },
      {
        title: "Onsite — DSA Round",
        format: "Virtual · 60 min",
        focus: "A problem modeled on a real Uber-style scenario (e.g. matching riders to drivers).",
        topics: ["Graphs", "Greedy", "Heaps"],
        tip: "State your assumptions about the input distribution — real-world-flavored problems reward the same clarifying-question habit as design rounds.",
      },
      {
        title: "System Design",
        format: "Virtual · 60 min",
        focus: "Design a ride-matching or location-tracking system at scale.",
        topics: ["Geo-indexing", "Load balancing", "Consistency trade-offs"],
        tip: "Bring up geo-sharding early — it's the detail interviewers are specifically listening for in this round.",
      },
      {
        title: "Values / Culture Round",
        format: "Virtual · 45 min",
        focus: "Behavioral round aligned to Uber's stated cultural norms (build with craftsmanship, be an owner).",
        topics: ["Ownership stories", "Craftsmanship examples"],
        tip: "Have one story specifically about catching and fixing a quality issue nobody asked you to fix.",
      },
    ],
  },
  {
    id: "flipkart",
    name: "Flipkart",
    initials: "F",
    color: "bg-yellow-500",
    role: "SDE-2",
    difficulty: "Hard",
    verdict: "Selected",
    tags: ["DSA", "System Design", "LLD"],
    summary:
      "Distinctly stronger emphasis on Low-Level Design (class diagrams, design patterns) compared to most product companies, in addition to standard DSA and HLD rounds.",
    rounds: [
      {
        title: "Online Assessment",
        format: "Online · 90 min",
        focus: "2-3 DSA problems of increasing difficulty.",
        topics: ["Arrays", "Dynamic Programming", "Graphs"],
        tip: "Partial credit is given for optimal-but-incomplete solutions — always submit your best attempt even under time pressure.",
      },
      {
        title: "Technical Round 1 — DSA",
        format: "Virtual · 60 min",
        focus: "1-2 hard DSA problems, live-coded with follow-up optimizations.",
        topics: ["Trees", "Tries", "Sliding Window"],
        tip: "Expect a brute-force-then-optimize flow — start with a working solution, then let the interviewer push you toward better complexity.",
      },
      {
        title: "Technical Round 2 — LLD",
        format: "Virtual · 60 min",
        focus: "Design a class structure for a real system (e.g. a parking lot, a rate limiter, an inventory system).",
        topics: ["SOLID principles", "Design patterns", "Class diagrams"],
        tip: "Justify every class and interface with a SOLID principle by name — it signals you're not just pattern-matching from memory.",
      },
      {
        title: "Technical Round 3 — HLD + Bar Raiser",
        format: "Virtual · 60 min",
        focus: "High-level system design plus a broader technical/behavioral discussion.",
        topics: ["Scalability", "Trade-offs", "Past project ownership"],
        tip: "This round often decides borderline offers — bring your strongest, most detailed project story here, not to earlier rounds.",
      },
    ],
  },
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    initials: "GS",
    color: "bg-blue-800",
    role: "Technology Analyst",
    difficulty: "Moderate",
    verdict: "Selected",
    tags: ["DSA", "CS Fundamentals", "Superday"],
    summary:
      "Multiple short back-to-back rounds on a single 'Superday' rather than spread over weeks — stamina and consistency across rounds matters as much as peak performance in any one.",
    rounds: [
      {
        title: "Online Assessment",
        format: "Online · 90 min",
        focus: "2 DSA problems + quantitative aptitude + CS fundamentals MCQs.",
        topics: ["Arrays", "Probability", "OOP basics"],
        tip: "The aptitude section is timed tightly — practice speed on quant problems separately from coding practice.",
      },
      {
        title: "Superday — Round 1",
        format: "Virtual · 30 min",
        focus: "DSA problem plus quick-fire CS fundamentals questions.",
        topics: ["Strings", "DBMS", "OS"],
        tip: "Rounds here are short — lead with your final approach fast, then fill in detail if there's time left.",
      },
      {
        title: "Superday — Round 2",
        format: "Virtual · 30 min",
        focus: "Project walkthrough with a focus on your specific individual contribution.",
        topics: ["Project internals", "Individual ownership"],
        tip: "Avoid 'we' language — Goldman interviewers specifically probe for what you personally built versus your team.",
      },
      {
        title: "Superday — HR/Final Round",
        format: "Virtual · 30 min",
        focus: "Fit for a fast-paced, high-accountability environment.",
        topics: ["Behavioral", "Working under pressure"],
        tip: "Keep every answer under two minutes — this culture rewards concise communication over long-form storytelling.",
      },
    ],
  },
  {
    id: "tcs",
    name: "TCS",
    initials: "T",
    color: "bg-indigo-800",
    role: "Ninja / Digital",
    difficulty: "Easy",
    verdict: "Selected",
    tags: ["Aptitude", "Coding Basics", "HR"],
    summary:
      "Mass-recruitment process — the written aptitude test is the real filter; technical and HR rounds are comparatively relaxed once you clear it.",
    rounds: [
      {
        title: "National Qualifier Test (NQT)",
        format: "Online · 3 hrs",
        focus: "Quantitative aptitude, verbal ability, reasoning, and a basic coding section.",
        topics: ["Percentages", "Time-Speed-Distance", "Logical reasoning", "Basic programming"],
        tip: "The aptitude section eliminates the most candidates — dedicate more prep time there than to the coding section.",
      },
      {
        title: "Technical Interview",
        format: "Virtual/Onsite · 20-30 min",
        focus: "Fundamentals of your core subject, a simple coding question, and resume-based questions.",
        topics: ["OOP basics", "DBMS basics", "Simple programs (e.g. reverse a string)"],
        tip: "Know your final-year project cold — it's almost always the centerpiece of this round.",
      },
      {
        title: "HR Interview",
        format: "Virtual/Onsite · 15-20 min",
        focus: "Willingness to relocate, work shifts, and general communication skills.",
        topics: ["Behavioral", "Company awareness"],
        tip: "Research TCS's business verticals beforehand — 'what do you know about us' is asked almost every time.",
      },
    ],
  },
  {
    id: "infosys",
    name: "Infosys",
    initials: "I",
    color: "bg-blue-600",
    role: "Systems Engineer",
    difficulty: "Easy",
    verdict: "Selected",
    tags: ["Aptitude", "Pseudocode", "HR"],
    summary:
      "Similar shape to TCS's process — a heavily weighted online test followed by lighter technical and HR conversations.",
    rounds: [
      {
        title: "Online Test",
        format: "Online · 95 min",
        focus: "Quantitative aptitude, logical reasoning, verbal ability, and a pseudocode section.",
        topics: ["Number series", "Puzzles", "Reading comprehension", "Pseudocode tracing"],
        tip: "The pseudocode section tests reading code, not writing it — practice tracing through unfamiliar snippets by hand.",
      },
      {
        title: "Technical Interview",
        format: "Virtual/Onsite · 20-30 min",
        focus: "Core subject fundamentals and simple hands-on coding.",
        topics: ["Programming basics", "DBMS", "Project discussion"],
        tip: "Be able to explain any acronym or technology you've written on your resume — vague answers here are an instant flag.",
      },
      {
        title: "HR Interview",
        format: "Virtual/Onsite · 15-20 min",
        focus: "Communication skills, career goals, and flexibility on location/role.",
        topics: ["Behavioral", "Career goals"],
        tip: "Stay positive and flexible about role/location questions — rigid answers here can cost an otherwise strong candidate the offer.",
      },
    ],
  },
];

const VERDICT_META = {
  Selected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};
const verdictClass = (verdict) =>
  VERDICT_META[verdict] ||
  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";

const DIFFICULTY_META = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Moderate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function CompanyCard({ company, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
        active
          ? "border-blue-400 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-900/20 shadow-sm"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-800"
      }`}
    >
      <div
        className={`shrink-0 w-10 h-10 rounded-full ${company.color} text-white flex items-center justify-center font-bold text-sm`}
      >
        {company.initials}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
          {company.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {company.role}
        </p>
      </div>
    </button>
  );
}

function RoundItem({ round, index, isLast }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="relative pl-9">
      {/* timeline dot + connecting line */}
      <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
        {index + 1}
      </div>
      {!isLast && (
        <div className="absolute left-[11px] top-7 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 text-left pb-1"
      >
        <div>
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
            {round.title}
          </h4>
          <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <Clock size={12} />
            {round.format}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="pb-6 pt-2 flex flex-col gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {round.focus}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {round.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {topic}
              </span>
            ))}
          </div>
          <div className="flex items-start gap-2 rounded-lg border-l-4 border-indigo-400 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/10 pl-3 pr-3 py-2.5">
            <Lightbulb size={14} className="shrink-0 mt-0.5 text-indigo-500 dark:text-indigo-400" />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {round.tip}
            </p>
          </div>
        </div>
      )}
      {!open && <div className="pb-5" />}
    </div>
  );
}

function CompanyDetail({ company }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div
            className={`shrink-0 w-14 h-14 rounded-full ${company.color} text-white flex items-center justify-center font-bold text-lg`}
          >
            {company.initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {company.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {company.role}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${DIFFICULTY_META[company.difficulty]}`}
          >
            {company.difficulty}
          </span>
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${verdictClass(company.verdict)}`}
          >
            <CheckCircle2 size={12} />
            {company.verdict}
          </span>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
        {company.summary}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-8">
        {company.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
        Interview Rounds
      </h3>
      <div className="flex flex-col">
        {company.rounds.map((round, i) => (
          <RoundItem
            key={round.title}
            round={round}
            index={i}
            isLast={i === company.rounds.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InterviewExperiencesPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState(ALL);
  const [selectedId, setSelectedId] = useState(companies[0].id);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (difficulty !== ALL && c.difficulty !== difficulty) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.role.toLowerCase().includes(q) &&
        !c.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      return true;
    });
  }, [search, difficulty]);

  const selectedCompany =
    filteredCompanies.find((c) => c.id === selectedId) || filteredCompanies[0];

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <section className="pt-16 pb-10 px-6 text-center">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Resources
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Interview Experiences
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Real round-by-round breakdowns from {companies.length} top
          companies — what to expect, what's actually tested, and what to
          prep before you walk in.
        </p>
      </section>

      {/* Filters */}
      <div className="sticky top-15 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-y border-slate-100 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies, roles, or tags…"
              className="w-full pl-10 pr-9 py-2.5 rounded-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">
              Difficulty
            </span>
            {DIFFICULTIES.map((d) => (
              <FilterChip
                key={d}
                label={d}
                active={difficulty === d}
                onClick={() => setDifficulty(d)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No experiences match those filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredCompanies.map((c) => (
                  <CompanyCard
                    key={c.id}
                    company={c}
                    active={selectedCompany?.id === c.id}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))}
              </div>

              {selectedCompany && <CompanyDetail company={selectedCompany} />}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
