import { Menu, X, ChevronDown, Moon, Sun } from "lucide-react";
import { useState } from "react";
import Logo from "./ui/Logo";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// ---- Guest (Public) Nav Structure ----
const guestNavItems = [
  {
    label: "Courses",
    items: [
      { label: "All Courses", to: "/courses/all" },
      { label: "By Topic", to: "/courses/by-topic" },
      { label: "By Company", to: "/courses/by-company" },
    ],
  },
  {
    label: "Practice",
    items: [
      { label: "Mock Tests", to: "/practice/mock-tests" },
      { label: "Coding Problems", to: "/practice/coding-problems" },
      { label: "Aptitude", to: "/practice/aptitude" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Notes", to: "/resources/notes" },
      { label: "Short Notes", to: "/resources/short-notes" },
      { label: "Interview Experiences", to: "/resources/interview-experiences" },
      { label: "Blogs", to: "/resources/blogs" },
    ],
  },
  { label: "AI Interview", to: "/ai-interview" },
  {
    label: "About",
    items: [
      { label: "About Us", to: "/about/us" },
      { label: "Our Team", to: "/about/team" },
      { label: "Contact", to: "/about/contact" },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "FAQs", to: "/help/faqs" },
      { label: "Support", to: "/help/support" },
    ],
  },
];

// ---- Logged-in Student Nav Structure ----
const studentNavItems = [
  {
    label: "Dashboard",
    items: [
      { label: "My Progress", to: "/dashboard/progress" },
      { label: "Bookmarks", to: "/dashboard/bookmarks" },
      { label: "History", to: "/dashboard/history" },
    ],
  },
  {
    label: "Courses",
    items: [
      { label: "Browse", to: "/courses/browse" },
      { label: "Enrolled", to: "/courses/enrolled" },
      { label: "Continue Learning", to: "/courses/continue" },
    ],
  },
  {
    label: "Practice",
    items: [
      { label: "Mock Tests", to: "/practice/mock-tests" },
      { label: "Coding Problems", to: "/practice/coding-problems" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Notes", to: "/resources/notes" },
      { label: "Short Notes", to: "/resources/short-notes" },
      { label: "Saved Notes", to: "/resources/saved-notes" },
    ],
  },
  {
    label: "AI Interview",
    items: [
      { label: "Start Session", to: "/ai-interview/start" },
      { label: "Past Sessions", to: "/ai-interview/past-sessions" },
    ],
  },
  {
    label: "About",
    items: [
      { label: "About Us", to: "/about/us" },
      { label: "Our Team", to: "/about/team" },
      { label: "Contact", to: "/about/contact" },
    ],
  },
  {
    label: "Help",
    items: [
      { label: "FAQs", to: "/help/faqs" },
      { label: "Support", to: "/help/support" },
    ],
  },
];

// ---- Desktop dropdown (hover) ----
function NavDropdown({
  label,
  to,
  items,
  align = "left",
  buttonClassName = "flex items-center gap-1 py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200",
}) {
  const [open, setOpen] = useState(false);

  if (!items) {
    return (
      <Link to={to} className="py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
        {label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button type="button" className={buttonClassName}>
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`absolute top-full pt-2 transition-all duration-200 ${
          align === "right" ? "right-0" : "left-0"
        } ${
          open
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 min-w-47.5">
          {items.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Mobile accordion section ----
function MobileNavSection({ label, to, items, openSection, setOpenSection, onNavigate }) {
  if (!items) {
    return (
      <Link
        to={to}
        onClick={onNavigate}
        className="text-slate-600 dark:text-slate-300 font-medium py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {label}
      </Link>
    );
  }

  const isOpen = openSection === label;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpenSection(isOpen ? null : label)}
        className="w-full flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium py-2"
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1 pl-4 pb-2">
          {items.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                className="text-sm text-slate-500 dark:text-slate-400 py-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  onNavigate();
                }}
                className="text-left text-sm text-rose-600 py-1.5"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ---- Theme toggle button ----
function ThemeToggle({ className = "" }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={`w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsMenuOpen(false);
    navigate("/login");
  };

  const goToAuth = (view) => {
    navigate(`/${view}`);
    setIsMenuOpen(false);
  };

  const navItems = token ? studentNavItems : guestNavItems;

  const profileItem = {
    label: "Profile",
    items: [
      { label: "Settings", to: "/profile/settings" },
      { label: "Logout", action: handleSignOut },
    ],
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2 group transition-transform duration-200 active:scale-95">
          <Logo className="w-9 h-9 text-blue-600 transition-transform group-hover:rotate-6" />
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-slate-900 dark:text-white">Prep</span>
            <span className="text-blue-600">Edge</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 font-medium text-sm text-slate-600 dark:text-slate-300">
          {navItems.map((item) => (
            <NavDropdown key={item.label} {...item} />
          ))}
        </div>

        {/* Desktop Action Area */}
        <div className="hidden md:flex items-center gap-3 text-sm font-semibold">
          <ThemeToggle />
          {token ? (
            <NavDropdown {...profileItem} align="right" />
          ) : (
            <>
              <NavDropdown
                label="Login"
                align="right"
                buttonClassName="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-full"
                items={[
                  { label: "User Login", to: "/login" },
                  { label: "Admin Login", to: "/admin/login" },
                ]}
              />
              <button
                onClick={() => goToAuth("signup")}
                className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 active:scale-95"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-xl px-6 py-6 flex flex-col gap-1 max-h-[80vh] overflow-y-auto transition-colors duration-200">
          {navItems.map((item) => (
            <MobileNavSection
              key={item.label}
              {...item}
              openSection={openMobileSection}
              setOpenSection={setOpenMobileSection}
              onNavigate={() => setIsMenuOpen(false)}
            />
          ))}

          <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />

          {token ? (
            <MobileNavSection
              {...profileItem}
              openSection={openMobileSection}
              setOpenSection={setOpenMobileSection}
              onNavigate={() => setIsMenuOpen(false)}
            />
          ) : (
            <div className="flex flex-col gap-3 pt-1">
              <MobileNavSection
                label="Login"
                items={[
                  { label: "User Login", to: "/login" },
                  { label: "Admin Login", to: "/admin/login" },
                ]}
                openSection={openMobileSection}
                setOpenSection={setOpenMobileSection}
                onNavigate={() => setIsMenuOpen(false)}
              />
              <button
                onClick={() => goToAuth("signup")}
                className="flex justify-center items-center font-semibold text-white bg-blue-600 py-2.5 rounded-full hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
