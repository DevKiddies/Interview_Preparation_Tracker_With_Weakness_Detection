import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./ui/Logo";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ authView, onAuthViewChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localAuthView, setLocalAuthView] = useState("login");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Use controlled state if props are passed, otherwise fallback to local state
  const currentView = authView || localAuthView;

  const handleToggle = (view) => {
    if (authView && onAuthViewChange) {
      onAuthViewChange(view);
    } else {
      setLocalAuthView(view);
    }
    navigate(`/${view}`);
    setIsMenuOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2 group transition-transform duration-200 active:scale-95">
            <Logo className="w-9 h-9 text-blue-600 transition-transform group-hover:rotate-6" />
            <span className="text-xl font-extrabold tracking-tight">
            <span className="text-slate-900">Prep</span>
            <span className="text-blue-600">Edge</span>
          </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <Link to="/courses" className="hover:text-blue-600 transition-colors duration-200">Courses</Link>
            <Link to="/mock-tests" className="hover:text-blue-600 transition-colors duration-200">Mock Tests</Link>
            <Link to="/about" className="hover:text-blue-600 transition-colors duration-200">About</Link>
            <Link to="/help" className="hover:text-blue-600 transition-colors duration-200">Help</Link>
          </div>

          {/* Desktop Action Area */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            {token ? (
                <>
                  <Link to="/dashboard" className="text-slate-700 hover:text-blue-600 transition-colors duration-200">
                    Dashboard
                  </Link>
                  <button
                      onClick={handleSignOut}
                      className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full hover:bg-rose-100 transition-all duration-200 active:scale-95"
                  >
                    Sign Out
                  </button>
                </>
            ) : (
                /* Sliding Auth Switch Control */
                <div className="relative flex items-center bg-slate-100 p-1 rounded-full w-44 border border-slate-200/50">
                  {/* Sliding Background Indicator */}
                  <div
                      className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-blue-600 rounded-full shadow-sm transition-all duration-300 ease-out ${
                          currentView === "signup" ? "translate-x-full" : "translate-x-0"
                      }`}
                  />

                  {/* Login Option */}
                  <button
                      onClick={() => handleToggle("login")}
                      className={`z-10 w-1/2 text-center py-1.5 rounded-full transition-colors duration-200 text-xs tracking-wide ${
                          currentView === "login" ? "text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Login
                  </button>

                  {/* Signup Option */}
                  <button
                      onClick={() => handleToggle("signup")}
                      className={`z-10 w-1/2 text-center py-1.5 rounded-full transition-colors duration-200 text-xs tracking-wide ${
                          currentView === "signup" ? "text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    Sign Up
                  </button>
                </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
              className="md:hidden text-slate-700 hover:text-blue-600 transition-colors p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl px-6 py-6 flex flex-col gap-4">
              <Link to="/courses" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-1 hover:text-blue-600 transition-colors">Courses</Link>
              <Link to="/mock-tests" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-1 hover:text-blue-600 transition-colors">Mock Tests</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-1 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/help" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium py-1 hover:text-blue-600 transition-colors">Help</Link>

              <div className="h-px bg-slate-100 my-2" />

              {token ? (
                  <div className="flex flex-col gap-3">
                    <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex justify-center items-center font-semibold text-slate-700 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="bg-rose-50 text-rose-600 font-semibold py-2.5 rounded-full hover:bg-rose-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
              ) : (
                  /* Centered Mobile Switch */
                  <div className="flex justify-center py-2">
                    <div className="relative flex items-center bg-slate-100 p-1 rounded-full w-full max-w-xs border border-slate-200/50">
                      <div
                          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-blue-600 rounded-full shadow-sm transition-all duration-300 ease-out ${
                              currentView === "signup" ? "translate-x-full" : "translate-x-0"
                          }`}
                      />
                      <button
                          onClick={() => handleToggle("login")}
                          className={`z-10 w-1/2 text-center py-2 rounded-full font-semibold transition-colors duration-200 text-sm ${
                              currentView === "login" ? "text-white" : "text-slate-600"
                          }`}
                      >
                        Login
                      </button>
                      <button
                          onClick={() => handleToggle("signup")}
                          className={`z-10 w-1/2 text-center py-2 rounded-full font-semibold transition-colors duration-200 text-sm ${
                              currentView === "signup" ? "text-white" : "text-slate-600"
                          }`}
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
              )}
            </div>
        )}
      </nav>
  );
}