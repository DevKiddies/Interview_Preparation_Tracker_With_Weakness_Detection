import { User, Mail, Lock, Menu, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

// UI import for the navigation bar and error alert component
import ErrorAlert from "../components/ui/ErrorAlert.jsx";
import InputField from "../components/ui/InputFields.jsx";

// Validation utility import for the sign-up form
import { validateSignupForm } from "../utils/validation.jsx";

function SignUpPage() {
  // Form state and error handling for the sign-up form
  const [error, setError] = useState("");

  // State to toggle password visibility (if you want to implement that feature later)
  const [showPassword, setShowPassword] = useState(false);

  // Form data state for the sign-up form.
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [success, setSuccess] = useState("");

  // FIXED: Consolidated to cleanly handle both standard inputs AND checkboxes dynamically
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission and update the inline error block instead of using browser alerts
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Run the external validation utility
    const validationError = validateSignupForm(formData);
    // If the utility returned a string error message, display it and stop submission
    if (validationError) {
      setError(validationError);
      return;
    }

    try { // Final payload preparation using your clean data from the form state.
      // If it returned null, everything is clean! Proceed with submission logic.
      const response = await fetch( "http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });
      if(response.ok){
        setSuccess("Account Created Successfully.");
        setFormData({username: "", email: "", password: "", confirmPassword: "", terms: false});
      }else{
        const message = await response.text();
        setError(message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {/*Added new wrap around to maintain the viewport to signup box only*/}
      <div className="flex flex-col items-center justify-center min-h-[calc(101vh-140px)] bg-[#f8fafc] w-full p-4 sm:p-6">

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-sm p-6 sm:p-8">
        <form
          className="flex flex-col items-stretch justify-center gap-0.5 w-full"
          onSubmit={handleSubmit}
        >
          <div className="my-1 text-center justify-center">
            <h2 className="text-xl font-bold">Create Your Account</h2>
            <p className="text-sm text-gray-400 font-light mb-6">
              Start your interview preparation with us today!
            </p>
          </div>

          {/* DYNAMIC ERROR MESSAGE WINDOW */}
          {error && <ErrorAlert message={error} />}
          {success && (
              <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-2.5 text-xs w-full mb-2">
                {success}
              </div>
          )}

          {/* Full Name */}
          <InputField
            label="Username"
            id="username"
            name="username"
            placeholder="John Doe"
            Icon={User}
            value={formData.username}
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
              className="bg-blue-600 text-white mt-2 rounded-lg py-2.5 px-4 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-center text-sm w-full font-medium cursor-pointer transition-all"
              id="signUp"
              type="submit"
          >
            Sign Up
          </button>

          <p className="text-xs text-gray-500 font-normal mt-4 text-center w-full">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
      </div>
    </>
  );
}

export default SignUpPage;
