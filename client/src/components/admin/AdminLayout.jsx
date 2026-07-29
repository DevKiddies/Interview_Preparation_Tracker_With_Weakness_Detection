import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, BarChart2, UserX,
  Database, PlusCircle, FolderOpen,
  ClipboardList, FilePlus, FileBarChart,
  TrendingUp, BarChart, Brain,
  Settings, LogOut, Menu, X, ChevronDown,
  Moon, Sun,
} from "lucide-react";
import Logo from "../ui/Logo";
import { useTheme } from "../../context/ThemeContext";

const navSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "User Management",
    items: [
      { label: "All Users", to: "/admin/users", icon: Users },
      { label: "User Results", to: "/admin/users/results", icon: BarChart2 },
      { label: "Banned Users", to: "/admin/users/banned", icon: UserX },
    ],
  },
  {
    title: "Question Management",
    items: [
      { label: "Question Bank", to: "/admin/questions", icon: Database },
      { label: "Add Question", to: "/admin/questions/add", icon: PlusCircle },
      { label: "Categories & Topics", to: "/admin/questions/categories", icon: FolderOpen },
    ],
  },
  {
    title: "Test Management",
    items: [
      { label: "All Tests", to: "/admin/tests", icon: ClipboardList },
      { label: "Create Mock Test", to: "/admin/tests/create", icon: FilePlus },
      { label: "Test Results", to: "/admin/tests/results", icon: FileBarChart },
    ],
  },
  {
    title: "Analytics & Reports",
    items: [
      { label: "Platform Overview", to: "/admin/analytics", icon: TrendingUp },
      { label: "User Reports", to: "/admin/analytics/users", icon: BarChart },
      { label: "Weakness Analysis", to: "/admin/analytics/weaknesses", icon: Brain, disabled: true },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Admin Settings", to: "/admin/settings", icon: Settings, disabled: true },
    ],
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const toggleSection = (title) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Logo className="w-7 h-7 text-blue-600" />
            <span className="text-lg font-extrabold tracking-tight">
              <span className="text-slate-900 dark:text-white">Prep</span>
              <span className="text-blue-600">Edge</span>
              <span className="ml-1.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md align-middle">
                Admin
              </span>
            </span>
          </Link>
          <button
            className="md:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => {
            const isCollapsed = collapsed[section.title];
            return (
              <div key={section.title} className="mb-3">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2 py-1 mb-1 group"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                    {section.title}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-slate-400 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="flex flex-col gap-0.5">
                    {section.items.map(({ label, to, icon: Icon, disabled }) => {
                      if (disabled) {
                        return (
                          <div
                            key={to}
                            title="Coming soon"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                          >
                            <Icon size={16} className="shrink-0" />
                            <span className="flex-1 min-w-0 truncate whitespace-nowrap">{label}</span>
                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                              Soon
                            </span>
                          </div>
                        );
                      }
                      const isActive = location.pathname === to;
                      return (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                            ${isActive
                              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                            }`}
                        >
                          <Icon size={16} className="shrink-0" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 shrink-0">
          <button
            onClick={toggle}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors w-full"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors w-full"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admin Panel</span>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
