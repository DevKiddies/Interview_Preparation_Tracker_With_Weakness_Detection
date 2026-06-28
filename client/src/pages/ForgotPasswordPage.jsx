// ForgotPasswordPage.jsx — two-step password reset flow.
// Step 1: user enters their email → server sends a 6-digit OTP.
// Step 2: user enters the OTP + new password → server validates and resets.
// On success a brief confirmation is shown before redirecting back to login.

import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE from "../utils/api.js";
import ErrorAlert from "../components/ui/ErrorAlert.jsx";
import InputField from "../components/ui/InputFields.jsx";

const OTP_LENGTH = 6;

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  // Step 1: sends a 6-digit OTP to the provided email via /api/auth/forgot-password
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) { setError("Please enter your email address."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStep(2);
      } else {
        setError(await res.text() || "Failed to send OTP. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Individual digit inputs: auto-advance on entry, backtrack on delete, support paste
  const handleOtpChange = (el, index) => {
    const val = el.value;
    if (isNaN(val)) return;
    const next = [...otp];
    next[index] = val.substring(val.length - 1);
    setOtp(next);
    if (val && index < OTP_LENGTH - 1) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (isNaN(pasted) || pasted.length !== OTP_LENGTH) return;
    setOtp(pasted.split(""));
    otpRefs.current[OTP_LENGTH - 1].focus();
  };

  // Step 2: validates OTP + new password then calls /api/auth/reset-password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    const otpValue = otp.join("");
    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otpValue, newPassword }),
      });
      if (res.ok) {
        setSuccess(true);
        // Give the user a moment to read the success screen before redirecting.
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(await res.text() || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state shown after the password has been reset
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(101vh-140px)] bg-[#f8fafc] dark:bg-slate-950 w-full p-4 transition-colors duration-200">
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm w-full max-w-sm p-8 text-center transition-colors duration-200">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold dark:text-white mb-2">Password Reset!</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Your password has been reset successfully. Redirecting to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(101vh-140px)] bg-[#f8fafc] dark:bg-slate-950 w-full p-4 sm:p-6 transition-colors duration-200">

      {step === 1 && (
        <>
          <div className="my-1 text-center">
            <h2 className="text-xl font-bold dark:text-white">Forgot Password?</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-light mb-6">
              Enter your email and we'll send you a reset code.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm w-full max-w-sm p-6 sm:p-8 mt-6 transition-colors duration-200">
            <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
              {error && <ErrorAlert message={error} />}

              <InputField
                label="Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                Icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white mt-3 rounded-lg py-2.5 px-4 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-sm font-medium w-full cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Send Reset Code"}
              </button>

              <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-2">
                Remember your password?{" "}
                <Link to="/login" className="text-blue-500 hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="my-1 text-center">
            <h2 className="text-xl font-bold dark:text-white">Reset Your Password</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 font-light mb-6">
              Enter the 6-digit code sent to <span className="font-medium text-gray-600 dark:text-slate-300">{email}</span> and choose a new password.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm w-full max-w-sm p-6 sm:p-8 mt-6 transition-colors duration-200">
            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              {error && <ErrorAlert message={error} />}

              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3">Verification Code</p>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      ref={(el) => (otpRefs.current[index] = el)}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handleOtpPaste}
                      onFocus={(e) => e.target.select()}
                      disabled={loading}
                      className="w-11 h-12 text-center text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 disabled:opacity-50"
                    />
                  ))}
                </div>
              </div>

              <InputField
                label="New Password"
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, upper, lower, number, symbol"
                Icon={Lock}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </InputField>

              <InputField
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                Icon={Lock}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              >
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </InputField>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white mt-3 rounded-lg py-2.5 px-4 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-sm font-medium w-full cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(new Array(OTP_LENGTH).fill("")); setError(""); }}
                className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors mt-1"
              >
                <ArrowLeft size={12} /> Back to email
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
