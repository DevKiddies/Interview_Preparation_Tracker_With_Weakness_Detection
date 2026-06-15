import { Mail, Lock, Eye, EyeOff, ShieldCheck, Users, BarChart3, Settings, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorAlert from "../components/ui/ErrorAlert.jsx";
import InputField from "../components/ui/InputFields.jsx";

const features = [
  {
    icon: Users,
    title: "User Management",
    description: "View, edit, and manage student accounts and permissions.",
  },
  {
    icon: BarChart3,
    title: "Platform Analytics",
    description: "Track engagement, course completion, and growth metrics.",
  },
  {
    icon: Settings,
    title: "System Settings",
    description: "Configure courses, content, and platform-wide settings.",
  },
];

function AdminLoginPage() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const meRes = await fetch("http://localhost:8080/api/users/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const me = await meRes.json();

        if (me.role !== "ADMIN") {
          setError("This account does not have admin access.");
          setLoading(false);
          return;
        }

        localStorage.setItem("token", data.token);
        navigate("/admin/dashboard");
      } else {
        const message = await response.text();
        setError(message || "Invalid credentials.");
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-slate-950 p-12">
        {/* Decorative glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <ShieldCheck size={18} className="text-blue-400" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Prep<span className="text-blue-400">Edge</span>{" "}
            <span className="text-slate-400 font-medium">Admin</span>
          </span>
        </div>

        {/* Middle: Headline + features */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage the platform from one control center.
          </h1>
          <p className="text-slate-400 text-sm mb-10">
            Sign in with your administrator credentials to access user data,
            analytics, and platform configuration tools.
          </p>

          <div className="flex flex-col gap-5">
            
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer note */}
        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} PrepEdge. Restricted access — authorized personnel only.
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-12 bg-[#f8fafc] relative">
        {/* Back to site link */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          Back to website
        </Link>

        <div className="w-full max-w-sm">
          {/* Mobile-only badge + heading */}
          <div className="flex flex-col items-center text-center mb-8 lg:items-start lg:text-left">
            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
              <ShieldCheck size={22} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Sign In</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your credentials to access the admin portal.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
            <form className="flex flex-col gap-0.5 w-full" onSubmit={handleSubmit}>
              {error && <ErrorAlert message={error} />}

              <InputField
                label="Admin Email or Username"
                id="identifier"
                name="identifier"
                type="text"
                placeholder="admin@prepedge.com"
                Icon={Mail}
                value={formData.identifier}
                onChange={handleChange}
              />

              <InputField
                label="Password"
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                Icon={Lock}
                value={formData.password}
                onChange={handleChange}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </InputField>

              <button
                className="bg-slate-900 text-white mt-5 rounded-lg py-2.5 px-4 hover:bg-slate-800 shadow-md shadow-slate-900/20 text-center text-sm w-full font-semibold cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in to Admin Portal"}
              </button>
            </form>
          </div>

          <p className="text-xs text-slate-500 font-normal mt-6 text-center w-full">
            Not an admin?{" "}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Go to user login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;