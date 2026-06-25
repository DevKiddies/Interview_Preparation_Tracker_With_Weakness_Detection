import { Target, Lightbulb, Users, TrendingUp, Award, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { value: "15,000+", label: "Active Learners" },
  { value: "5,000+", label: "Practice Questions" },
  { value: "1,200+", label: "Offers Landed" },
  { value: "98%", label: "Satisfaction Rate" },
];

const values = [
  {
    icon: Target,
    title: "Outcome-Focused",
    desc: "Every feature we build is measured by one thing: did it help you get the job?",
  },
  {
    icon: Lightbulb,
    title: "Intelligence-Driven",
    desc: "We use AI to personalise your prep path — no more one-size-fits-all study plans.",
  },
  {
    icon: Users,
    title: "Community First",
    desc: "Real interview experiences shared by real people who've been through it.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Growth",
    desc: "We track your weaknesses so you can turn them into your strongest talking points.",
  },
  {
    icon: Award,
    title: "Quality Over Quantity",
    desc: "Curated FAANG-grade questions, not a flood of mediocre problems.",
  },
  {
    icon: BookOpen,
    title: "Learn by Doing",
    desc: "Timed mock tests and instant feedback keep theory from ever replacing practice.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Hero */}
      <section className="bg-blue-50 dark:bg-slate-800/60 pt-16 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Our Story
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5 leading-tight">
            Built by students who{" "}
            <span className="text-indigo-500 italic">felt the pain.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            PrepEdge started as a CDAC final-year project. We were tired of scattered resources,
            generic advice, and zero visibility into where we were actually going wrong. So we
            built the platform we wish had existed.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 px-6 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="inline-block bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
              Making interview prep smarter, not harder.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              The interview process is broken. Companies test for performance under artificial
              pressure, and most prep resources just pile on more content without helping you
              understand where you're falling short.
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Our mission is to close that gap with intelligent weakness detection, personalised
              learning paths, and real-world AI mock interviews — so that when you walk into that
              room, you're ready.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-1 gap-4 w-full">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-200 font-semibold mb-1">What we're not</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                We're not another question dump. We don't want you to grind 500 problems and hope
                for the best. We want you to understand your gaps and fix them.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50">
              <p className="text-blue-700 dark:text-blue-400 font-semibold mb-1">What we are</p>
              <p className="text-blue-600/80 dark:text-blue-400/80 text-sm leading-relaxed">
                An intelligent preparation companion that watches how you perform, learns your
                patterns, and steers your study time toward maximum impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Our core values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white mb-1">{title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          Want to meet the people behind PrepEdge?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-7 max-w-md mx-auto">
          We're a small, passionate team — and we'd love for you to know who's building this.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/about/team"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-sm"
          >
            Meet the Team
          </Link>
          <Link
            to="/about/contact"
            className="border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-6 py-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 text-sm"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}
