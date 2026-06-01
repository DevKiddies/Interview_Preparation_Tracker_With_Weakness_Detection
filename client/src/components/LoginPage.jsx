import { User, Mail, Lock, Menu, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// UI import for the navigation bar and error alert component
import Navbar from "./Navbar";
import ErrorAlert from "./ui/ErrorAlert";
import InputField from "./ui/InputFields";

// Validation utility import for the sign-up form
import { validateSignupForm } from "../utils/validation";

function LoginPage() {
  // Form state and error handling for the sign-up form
  const [error, setError] = useState("");

  // State to toggle password visibility (if you want to implement that feature later)
  const [showPassword, setShowPassword] = useState(false);

  // Form data state for the sign-up form.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // FIXED: Consolidated to cleanly handle both standard inputs AND checkboxes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission and update the inline error block instead of using browser alerts
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Run the external validation utility
    const validationError = validateSignupForm(formData);

    // If the utility returned a string error message, display it and stop submission
    if (validationError) {
      setError(validationError);
      return;
    }

    // Final payload preparation using your clean data from the form state.
    // If it returned null, everything is clean! Proceed with submission logic.
    const submissionPayload = {
      email: formData.email.trim(),
      password: formData.password,
    };

    console.log("Form Submitted Successfully:", submissionPayload);
    // Next Step: Send submissionPayload to your backend API route here!
  };

  return (
    <>
      <Navbar />

      <div className="text-2xl text-center mx-auto border border-gray-300 rounded-xl shadow-lg w-[92%] max-w-sm mt-10 mb-10 p-6 sm:p-8">
        <form className="flex flex-col items-stretch justify-center gap-0.5 w-full" onSubmit={handleSubmit}>
          
          {/* Header Identity Block */}
          <div className="my-1 text-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1 shadow-md">
              <span className="text-2xl text-blue-700 font-bold">JD</span>
            </div>
            <h2 className="text-xl font-bold">Welcome Back</h2>
            <p className="text-sm text-gray-400 font-light mb-6">
              Sign in to continue your interview preparation!
            </p>
          </div>

          {/* Social Authentication Integration */}
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

          {/* Decorative Divider Split */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Messaging Window */}
          <ErrorAlert message={error} />

          {/* Form Inputs */}
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
            {/* FIX: Handled eye icon insertion directly via children pattern */}
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </InputField>

          {/* Secondary Navigational Options Layout */}
          <div className="text-right mt-1.5 mb-4">
            <Link to="/forgot-password" className="text-xs text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Primary Submit Button */}
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-500 rounded-4xl py-2 px-4 hover:from-blue-700 hover:to-blue-600 [box-shadow:0_2px_6px_rgba(0,0,255,0.35)] text-center text-sm font-medium w-full cursor-pointer transition-all"
            id="loginButton"
            type="submit"
          >
            Login
          </button>

          {/* Catch-all Footnote Redirect Link */}
          <p className="text-sm text-gray-400 mt-4 text-center w-full">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default LoginPage;
