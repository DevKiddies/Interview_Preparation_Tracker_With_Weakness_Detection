import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import ErrorAlert from "../components/ui/ErrorAlert.jsx";
import InputField from "../components/ui/InputFields.jsx";
import { validateSignupForm } from "../utils/validation.jsx";

function SignUpPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateSignupForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (response.ok) {
        setSuccess("Account created successfully! You can now log in.");
        setFormData({ username: "", email: "", password: "", confirmPassword: "", terms: false });
      } else {
        const message = await response.text();
        setError(message);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
      <>
        <div className="text-2xl text-center mx-auto border border-gray-300 rounded-xl shadow-lg w-[92%] max-w-sm mt-10 mb-10 p-6 sm:p-8">
          <form className="flex flex-col items-stretch justify-center gap-0.5 w-full" onSubmit={handleSubmit}>

            <div className="my-1 text-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1 shadow-md">
                <span className="text-2xl text-blue-700 font-bold">JD</span>
              </div>
              <h2 className="text-xl font-bold">Create Your Account</h2>
              <p className="text-sm text-gray-400 font-light mb-6">
                Start your interview preparation with us today!
              </p>
            </div>

            {error && <ErrorAlert message={error} />}

            {success && (
                <div className="bg-green-100 text-green-700 border border-green-300 rounded-lg px-4 py-2 text-xs w-full mb-2">
                  {success}
                </div>
            )}

            <InputField
                label="Username"
                id="username"
                name="username"
                placeholder="john_doe"
                Icon={User}
                value={formData.username}
                onChange={handleChange}
            />

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
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </InputField>

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
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </InputField>

            <div className="flex items-start mt-3 mb-4 text-left">
              <input type="checkbox" id="terms" name="terms" checked={formData.terms} onChange={handleChange} className="mt-0.5 mr-2 flex-shrink-0" />
              <label htmlFor="terms" className="text-xs text-gray-400 select-none">
                I agree to the{" "}
                <Link to="/terms" className="text-blue-500 hover:underline">Terms and Conditions</Link>
              </label>
            </div>

            <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white mt-2 border-blue-500 rounded-4xl py-2 px-4 hover:from-blue-700 hover:to-blue-600 [box-shadow:0_2px_6px_rgba(0,0,255,0.35)] text-center text-sm w-full cursor-pointer transition-all" type="submit">
              Sign Up
            </button>

            <p className="text-sm text-gray-400 font-semilight mt-3 text-center w-full">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">Log in</Link>
            </p>

          </form>
        </div>
      </>
  );
}

export default SignUpPage;