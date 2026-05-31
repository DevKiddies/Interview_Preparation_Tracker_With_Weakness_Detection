import { User, Mail, Lock, Menu, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// UI import for the navigation bar and error alert component
import ErrorAlert from "./ui/ErrorAlert";
import InputField from "./ui/InputFields";

// Validation utility import for the sign-up form
import { validateSignupForm } from "../utils/validation";

function SignUpPage() {
  // Form state and error handling for the sign-up form
  const [error, setError] = useState("");

  // State to toggle password visibility (if you want to implement that feature later)
  const [showPassword, setShowPassword] = useState(false);

  // Form data state for the sign-up form.
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // FIXED: Consolidated to cleanly handle both standard inputs AND checkboxes dynamically
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      terms: formData.terms,
    };

    console.log("Form Submitted Successfully:", submissionPayload);
    // Next Step: Send submissionPayload to your backend API route here!
  };

  return (
    <>
      <div className="text-2xl text-center mx-auto border border-gray-300 rounded-xl shadow-lg w-[92%] max-w-sm mt-10 mb-10 p-6 sm:p-8">
        <form
          className="flex flex-col items-stretch justify-center gap-0.5 w-full"
          onSubmit={handleSubmit}
        >
          <div className="my-1 text-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1 shadow-md">
              <span className="text-2xl text-blue-700 font-bold">JD</span>
            </div>
            <h2 className="text-xl font-bold">Create Your Account</h2>
            <p className="text-sm text-gray-400 font-light mb-6">
              Start your interview preparation with us today!
            </p>
          </div>

          {/* DYNAMIC ERROR MESSAGE WINDOW */}
          {error && <ErrorAlert message={error} />}

          {/* Full Name */}
          <InputField
            label="Full Name"
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            Icon={User}
            value={formData.fullName}
            onChange={handleChange}
          />

          {/* Email */}
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

          {/* Password */}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </InputField>

          {/* Confirm Password */}
          <InputField
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            Icon={Lock}
            value={formData.confirmPassword}
            onChange={handleChange}
          >
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            </InputField>

          {/* Terms Checkbox */}
          <div className="flex items-start mt-3 mb-4 text-left">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="mt-0.5 mr-2 flex-shrink-0"
            />
            <label
              htmlFor="terms"
              className="text-xs text-gray-400 select-none"
            >
              I agree to the{" "}
              <a href="/terms" className="text-blue-500 hover:underline">
                Terms and Conditions
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white mt-2 border-blue-500 rounded-4xl py-2 px-4 hover:from-blue-700 hover:to-blue-600 [box-shadow:0_2px_6px_rgba(0,0,255,0.35)] text-center text-sm w-full cursor-pointer transition-all"
            id="signUp"
            type="submit"
          >
            Sign Up
          </button>

          <p className="text-sm text-gray-400 font-semilight mt-3 text-center w-full">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </>
  );
}

export default SignUpPage;
