// Footer.jsx — site-wide footer with column-based link groups and social icons.
// Links are defined as data arrays so adding/removing items doesn't require touching the JSX.

import { Link } from 'react-router-dom';
import Logo from "./ui/Logo.jsx";

const footerLinks = [
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about/us" },
      { label: "Our Team", to: "/about/team" },
      { label: "Contact Us", to: "/about/contact" },
    ],
  },
  {
    heading: "Practice",
    links: [
      { label: "Mock Tests", to: "/practice/mock-tests" },
      { label: "Coding Problems", to: "/practice/coding-problems" },
      { label: "Aptitude & Reasoning", to: "/practice/aptitude" },
      { label: "AI Interview", to: "/ai-interview" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Notes", to: "/resources/notes" },
      { label: "Cheat Sheets", to: "/resources/cheat-sheets" },
      { label: "Interview Experiences", to: "/resources/interview-experiences" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "FAQs", to: "/help/faqs" },
      { label: "Support", to: "/help/support" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
];

const socialLinks = [
  {
    label: "LinkedIn",
    to: "/",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    to: "/",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    to: "/",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    to: "/",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    to: "/",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-slate-50 dark:bg-[#0d1117] transition-colors duration-200">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 pb-6">

        {/* Main grid:
            mobile  → 2 columns (brand full-width, links in 2×2)
            desktop → 6 columns (brand 2/6, each link col 1/6)         */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-6">

          <div className="col-span-2 lg:col-span-2 flex flex-col gap-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <Logo className="w-8 h-8 text-blue-600 transition-transform group-hover:rotate-6" />
              <span className="text-xl font-black tracking-tight">
                <span className="text-slate-900 dark:text-white">Prep</span>
                <span className="text-blue-600">Edge</span>
              </span>
            </Link>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              The intelligent interview prep platform for ambitious engineers. Practice smarter, get hired faster.
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {socialLinks.map(({ label, to, svg }) => (
                <Link
                  key={label}
                  to={to}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:border-blue-600 dark:hover:text-white transition-all duration-200"
                >
                  {svg}
                </Link>
              ))}
            </div>
          </div>

          {footerLinks.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="mt-12 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} PrepEdge. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
