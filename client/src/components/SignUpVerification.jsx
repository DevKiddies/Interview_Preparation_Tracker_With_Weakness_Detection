import { useEffect, useState } from "react";
import { Mail, ArrowLeft } from "lucide-react"; // Matching your icon set
import { useLocation } from "react-router-dom"; // <-- Importing useLocation to read query parameters from the URL

import Navbar from "./Navbar";

// Helper function to mask email (e.g., tanishq@example.com -> ta*****q@example.com)
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "your email";
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }

  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
};

function SignUpVerification({ email = "tanishq@example.com" }) {
  // 1. Manage the cooldown state (Starts at 30 seconds)
  const [cooldown, setCooldown] = useState(30);
  // State to manage the resend button's loading state
  const [isResending, setIsResending] = useState(false);
  // Read the email from URL query parameters if provided (e.g., /verify?email=tanishq@example.com)
  const location = useLocation();
    useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromQuery = queryParams.get("email");
    if (emailFromQuery) {
      // You can set the email state here if needed
    }
  }, [location.search]);

  // 2. Ticking effect that decreases the timer every second
  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    // Clean up interval when component unmounts or timer hits 0
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return; // Guard clause

    setIsResending(true);
    console.log("Triggering verification API endpoint for:", email);

    // Simulated API call block
    try {
      // await axios.post('/api/auth/resend-verification', { email });

      // On success, reset the 30-second cooldown lock
      setCooldown(30);
    } catch (err) {
      console.error("Failed to resend validation signal:", err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="text-2xl text-center mx-auto border border-gray-300 rounded-xl shadow-lg w-[92%] max-w-sm mt-10 mb-10 p-6 sm:p-8">
        {/* Brand Icon Header */}
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 shadow-md">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>

        <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>

        {/* Securely Masked Email Output */}
        <p className="text-sm text-gray-500 font-light mb-6 leading-relaxed">
          A verification link has been sent to{" "}
          <span className="font-medium text-gray-800 break-all">
            {maskEmail(email)}
          </span>
          . Please check your inbox to activate your account.
        </p>

        {/* Cooldown Controlled Action Button */}
        <button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-4xl py-2 px-4 text-sm font-medium transition-all [box-shadow:0_2px_6px_rgba(0,0,255,0.35)] disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
        >
          {isResending
            ? "Sending..."
            : cooldown > 0
              ? `Resend Email in ${cooldown}s`
              : "Resend Verification Email"}
        </button>

        {/* Back navigation option */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          <ArrowLeft size={14} className="text-gray-400" />
          <a href="/signup" className="text-xs text-blue-500 hover:underline">
            Back to Sign Up
          </a>
        </div>
      </div>
    </>
  );
}

export default SignUpVerification;
