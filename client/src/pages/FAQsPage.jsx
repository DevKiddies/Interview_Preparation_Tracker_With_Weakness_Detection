// FAQsPage.jsx — accordion-style frequently asked questions page.
// Each question expands on click to show the answer below it.

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is PrepEdge?",
        a: "PrepEdge is an intelligent interview preparation platform that helps you practice coding problems, take mock tests, and track your weaknesses using AI — so you can focus your time where it matters most.",
      },
      {
        q: "Is PrepEdge free to use?",
        a: "Yes! The core features including practice problems, mock tests, and progress tracking are free. We may introduce premium features in the future, but the essentials will always remain accessible.",
      },
      {
        q: "Do I need to create an account?",
        a: "You can browse content as a guest, but creating a free account lets you save progress, track weaknesses, and access personalised recommendations.",
      },
    ],
  },
  {
    category: "Features",
    items: [
      {
        q: "How does the weakness detection work?",
        a: "PrepEdge analyses your performance across topics and question types over time. It identifies patterns in where you lose marks or take too long, then surfaces targeted practice to close those gaps.",
      },
      {
        q: "What kind of questions are available?",
        a: "We offer data structures & algorithms, aptitude, system design concepts, and curated FAANG-style coding problems. New questions are added regularly.",
      },
      {
        q: "What is the AI Interview feature?",
        a: "The AI Interview simulates a real technical interview. You get asked questions, respond in real time, and receive feedback on your answers — helping you get comfortable with the actual interview format.",
      },
      {
        q: "Can I practice for a specific company?",
        a: "Yes. You can filter problems and mock tests by company (e.g. Google, Amazon, Microsoft) to focus your prep on the questions those companies are known to ask.",
      },
    ],
  },
  {
    category: "Account & Data",
    items: [
      {
        q: "How do I reset my password?",
        a: "On the login page, click 'Forgot Password' and enter your registered email. You'll receive a reset link within a few minutes.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. We use industry-standard JWT authentication, encrypted storage, and never share your personal data with third parties.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. You can request account deletion from your profile settings. All your data will be permanently removed within 7 days.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-150"
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm pr-4">{q}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white dark:bg-slate-800">
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQsPage() {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Hero */}
      <section className="bg-blue-50 dark:bg-slate-800/60 pt-16 pb-20 px-6 text-center">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Help Center
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Frequently Asked{" "}
          <span className="text-indigo-500 italic">Questions</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Everything you need to know about PrepEdge. Can't find your answer?{" "}
          <Link to="/help/support" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Contact support.
          </Link>
        </p>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          {faqs.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
                {category}
              </h2>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <FAQItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="relative py-14 px-6 bg-slate-50/60 dark:bg-slate-900/60 text-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          Still have questions?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-7 max-w-md mx-auto">
          Our support team is happy to help. Reach out and we'll get back to you within 24 hours.
        </p>
        <Link
          to="/help/support"
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-sm"
        >
          Contact Support
        </Link>
      </section>
    </div>
  );
}
