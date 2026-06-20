import { Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from "./ui/Logo.jsx";

const footerLinks = [
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about/us" },
      { label: "Our Team", to: "/about/team" },
      { label: "Contact Us", to: "/about/contact" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    heading: "Practice",
    links: [
      { label: "Mock Tests", to: "/practice/mock-tests" },
      { label: "Coding Problems", to: "/practice/coding-problems" },
      { label: "Aptitude", to: "/practice/aptitude" },
      { label: "AI Interview", to: "/ai-interview" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Notes", to: "/resources/notes" },
      { label: "Short Notes", to: "/resources/short-notes" },
      { label: "Interview Experiences", to: "/resources/interview-experiences" },
      { label: "Blogs", to: "/resources/blogs" },
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
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
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    to: "/",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    to: "/",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
        <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-colors duration-200">

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <Logo className="w-7 h-7 text-blue-600 transition-transform group-hover:rotate-6" />
              <span className="text-xl font-black tracking-tight">
                <span className="text-slate-900 dark:text-white">Prep</span>
                <span className="text-blue-600">Edge</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              The intelligent interview preparation platform for ambitious software engineers. Practice smarter, get hired faster.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-1">
              {socialLinks.map(({ label, to, svg }) => (
                <Link
                  key={label}
                  to={to}
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:border-blue-600 dark:hover:text-white transition-all duration-200"
                >
                  {svg}
                </Link>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-2">
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Get system updates
              </p>
              <form
                onSubmit={handleSubscribe}
                className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 focus-within:border-blue-500 transition-colors h-9 shadow-sm max-w-xs"
              >
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 px-3 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full transition-all active:scale-95 shrink-0 shadow-md shadow-blue-500/20"
                  aria-label="Subscribe"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ heading, links }) => (
            <div key={heading} className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">{heading}</h4>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} PrepEdge. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
