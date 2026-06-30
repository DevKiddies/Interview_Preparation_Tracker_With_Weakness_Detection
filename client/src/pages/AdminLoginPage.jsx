// AdminLoginPage.jsx — login page for platform admins only (not regular users).
// Uses a separate adminToken in localStorage so an admin can be logged in
// alongside a regular user session without conflicts.

import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ErrorAlert from "../components/ui/ErrorAlert.jsx";
import InputField from "../components/ui/InputFields.jsx";
import API_BASE from "../utils/api.js";

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
      const response = await fetch(`${API_BASE}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Store under 'adminToken', not 'token', to avoid colliding with the user session.
        localStorage.setItem("adminToken", data.token);
        navigate("/");
      } else {
        const message = await response.text();
        setError(message || "Invalid credentials.");
      }
    } catch {
      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(101vh-140px)] bg-[#f8fafc] dark:bg-slate-950 w-full p-4 sm:p-6 transition-colors duration-200">
      <div className="my-1 text-center justify-center flex flex-col items-center">
        <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-3">
          <ShieldCheck size={20} className="text-blue-600" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">Admin Sign In</h2>
        <p className="text-xs text-gray-400 dark:text-slate-500 font-light mb-6">
          Enter your credentials to access the admin portal.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm w-full max-w-sm p-6 sm:p-8 mt-2 transition-colors duration-200">
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
            className="bg-blue-600 text-white mt-5 rounded-lg py-2.5 px-4 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-center text-sm w-full font-medium cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in to Admin Portal"}
          </button>

          <p className="text-xs text-gray-500 dark:text-slate-400 font-normal mt-4 text-center w-full">
            Not an admin?{" "}
            <Link
              to="/login"
              className="text-blue-500 hover:underline font-medium"
            >
              Go to user login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
