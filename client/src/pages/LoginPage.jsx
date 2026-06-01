import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// UI components
import ErrorAlert from "../components/ui/ErrorAlert.jsx";
import InputField from "../components/ui/InputFields.jsx";

function LoginPage() {
  // Form state and error handling
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form data state tailored exclusively for logging in (email and password only)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for existing users
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Submission payload targeting your active login endpoint
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      if (response.ok) {
        console.log("Logged in successfully!");
        // Next Step: Route them to your onboarding wizard or dashboard
      } else {
        const message = await response.text();
        setError(message || "Invalid email or password.");
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    }
  };

  return (
    <>
      {/* Structural layout wrapper aligning container vertically with Navbar context */}
      <div className="flex flex-col items-center justify-center min-h-[calc(101vh-140px)] bg-[#f8fafc] w-full p-4 sm:p-6">
        
        {/* Card Component displaying Suhani's polished border and padding rules */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-sm p-6 sm:p-8">
          <form className="flex flex-col items-stretch justify-center gap-0.5 w-full" onSubmit={handleSubmit}>
            
            {/* Header Block */}
            <div className="my-1 text-center justify-center">
              <h2 className="text-xl font-bold">Welcome Back</h2>
              <p className="text-xs text-gray-400 font-light mb-6">
                Sign in to continue your interview preparation!
              </p>
            </div>

            {/* RESTORED: Your Social Authentication Integration */}
            <div className="flex flex-col gap-2.5">
              <button
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-4xl py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors w-full"
                type="button"
              >
                <img src="https://img.icons8.com/fluency/96/google-logo.png" alt="Google" className="w-5 h-5"/>
                <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-4xl py-2 px-4 hover:bg-gray-100 cursor-pointer transition-colors w-full"
                type="button"
              >
                <img src="https://img.icons8.com/fluency/96/github.png" alt="GitHub" className="w-5 h-5"/>
                <span className="text-sm font-medium text-gray-700">Sign in with GitHub</span>
              </button>
            </div>

            {/* RESTORED: Your Decorative Divider Split */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* DYNAMIC ERROR MESSAGE WINDOW */}
            {error && <ErrorAlert message={error} />}

            {/* Email Field */}
            <InputField
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              Icon={Mail}
              value={formData.email}
              onChange={handleChange}
            />

            {/* Password Field with Nested Show/Hide Action Slot */}
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

            {/* Secondary Navigational Options */}
            <div className="text-right mt-2 mb-4">
              <Link to="/forgot-password" className="text-xs text-blue-500 hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Primary Submit Button */}
            <button
              className="bg-blue-600 text-white mt-1 rounded-lg py-2.5 px-4 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-center text-sm w-full font-medium cursor-pointer transition-all"
              id="loginButton"
              type="submit"
            >
              Login
            </button>

            {/* Redirect Footer Footnote Link */}
            <p className="text-xs text-gray-500 font-normal mt-4 text-center w-full">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500 hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginPage;