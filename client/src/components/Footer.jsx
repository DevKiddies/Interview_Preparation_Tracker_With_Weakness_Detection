import { Send } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from "./ui/Logo.jsx";

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  return (
      <footer className="border-t border-slate-100 bg-slate-50/50 px-6 py-10">
        <div className="max-w-7xl mx-auto">

          {/* Main Grid: Clean structural split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pb-8 border-b border-slate-200/60">

            {/* Left Column: Vertical Brand Stacking */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Link to="/" className="flex items-center gap-2 group mb-2.5">
                <Logo className="w-6 h-6 text-blue-600 transition-transform group-hover:rotate-6" />
                <span className="text-lg font-black tracking-tight">
                <span className="text-slate-900">Prep</span>
                <span className="text-blue-600">Edge</span>
              </span>
              </Link>
              <p className="text-xs font-medium text-slate-400 max-w-xs leading-relaxed">
                The intelligent interview preparation platform for ambitious software engineers.
              </p>
            </div>

            {/* Right Column: Interactive Elements & Links */}
            <div className="flex flex-col items-center md:items-end gap-6">
              {/* Targeted Micro-Newsletter */}
              <div className="w-full max-w-xs">
                <label htmlFor="footer-email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center md:text-left">
                  Get system updates
                </label>
                <form
                    onSubmit={handleSubscribe}
                    className="relative flex items-center bg-white border border-slate-200 rounded-full p-1 focus-within:border-blue-500 transition-colors h-9 shadow-sm"
                >
                  <input
                      id="footer-email"
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="flex-1 bg-transparent text-xs text-slate-800 px-3 outline-none placeholder-slate-400"
                  />
                  <button
                      type="submit"
                      className="bg-blue-600  hover:from-blue-700 text-white p-1.5 rounded-full transition-all active:scale-95 shrink-0 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                      aria-label="Subscribe"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* Bottom Meta Bar: Perfect Horizontal Baseline Alignment */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            <p className="select-none">© 2026 PREPEDGE. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-6 font-bold text-slate-500 normal-case tracking-normal">
              <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
              <Link to="/help" className="hover:text-blue-600 transition-colors">Help</Link>
            </div>
          </div>

        </div>
      </footer>
  );
}