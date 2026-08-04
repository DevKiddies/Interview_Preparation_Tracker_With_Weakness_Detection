// LoginPage.jsx — handles email/password login as well as Google and GitHub OAuth.
// After a successful login we always call /api/users/me to get the 'onboarded' flag
// and redirect new users to /onboarding and returning users to /dashboard.

import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import API_BASE from "../utils/api.js";
import { setCachedProfile } from "../utils/profileCache";

import ErrorAlert from "../components/ui/ErrorAlert.jsx";
import InputField from "../components/ui/InputFields.jsx";

// GitHub OAuth is a full-page redirect (not a fetch call), so the backend can only
// hand back an error via query params, not a JSON body — this turns those into
// the same error text a failed email/password or Google login would show.
function initialErrorFromQuery(searchParams) {
  const error = searchParams.get("error");
  if (!error) return "";
  if (error === "banned") {
    return searchParams.get("message") || "Your account has been banned. Please contact administration.";
  }
  if (error === "github_login_failed") {
    return "GitHub login failed. Please try again.";
  }
  return "";
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectedFrom = location.state?.from;

  // If BanGuard just force-logged this user out mid-session, show that message
  // immediately instead of a blank login form. Falls back to a query-param error
  // (e.g. from the GitHub OAuth redirect flow) if there's no navigation state.
  const [error, setError] = useState(
    location.state?.message || initialErrorFromQuery(searchParams),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);

        // Fetch the full profile to check if the user has completed onboarding,
        // and to store their username so the Navbar can display it right away.
        const meRes = await fetch(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const me = await meRes.json();
        if (me.username) localStorage.setItem("username", me.username);
        if (me.avatarUrl) localStorage.setItem("avatarUrl", me.avatarUrl);
        setCachedProfile(me);
        navigate(me.onboarded ? "/dashboard" : "/onboarding");
      } else {
        const message = await response.text();
        setError(message || "Invalid credentials.");
      }
    } catch {
      setError(
        "Something went wrong. Please check your connection and try again.",
      );
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError("");
      try {
        // Fire both requests in parallel to reduce wait time:
        // Google's userinfo endpoint (for the avatar picture) and our backend auth.
        const [googleInfo, response] = await Promise.all([
          fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }).then((r) => r.json()),
          fetch(`${API_BASE}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken: tokenResponse.access_token }),
          }),
        ]);

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          const meRes = await fetch(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${data.token}` },
          });
          const me = await meRes.json();
          if (me.username) localStorage.setItem("username", me.username);
          const avatar = me.avatarUrl || googleInfo.picture || "";
          if (avatar) localStorage.setItem("avatarUrl", avatar);
          setCachedProfile({ ...me, avatarUrl: avatar || me.avatarUrl });
          window.dispatchEvent(new CustomEvent("user-profile-updated"));
          navigate(me.onboarded ? "/dashboard" : "/onboarding");
        } else {
          const message = await response.text();
          setError(message || "Google login failed.");
        }
      } catch {
        setError("Google login failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Google sign-in was cancelled or failed.");
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(101vh-140px)] bg-[#f8fafc] dark:bg-slate-950 w-full p-4 sm:p-6 transition-colors duration-200">
        <div className="w-full max-w-sm mb-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </div>
        <div className="my-1 text-center justify-center">
          {redirectedFrom ? (
            <>
              <h2 className="text-xl font-bold dark:text-white">Login to Continue</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-light mb-6">
                Sign in to access this feature and track your progress.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold dark:text-white">Welcome Back</h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-light mb-6">
                Sign in to continue your interview preparation!
              </p>
            </>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm w-full max-w-sm p-6 sm:p-8 mt-6 transition-colors duration-200">
          <form
            className="flex flex-col items-stretch justify-center gap-0.5 w-full"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2.5">
              <button
                className="flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-600 rounded-4xl py-2 px-4 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors w-full disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={googleLoading}
              >
                <img
                  src="https://img.icons8.com/fluency/96/google-logo.png"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {googleLoading ? "Signing in..." : "Sign in with Google"}
                </span>
              </button>

              <button
                className="flex items-center justify-center gap-2 border border-gray-300 dark:border-slate-600 rounded-4xl py-2 px-4 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors w-full"
                type="button"
                onClick={() =>
                  (window.location.href =
                    `${API_BASE}/api/auth/github`)
                }
              >
                <img
                  src="https://img.icons8.com/fluency/96/github.png"
                  alt="GitHub"
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Sign in with GitHub
                </span>
              </button>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-gray-400 dark:text-slate-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {error && <ErrorAlert message={error} />}

            <InputField
              label="Email or Username"
              id="identifier"
              name="identifier"
              type="text"
              placeholder="name@example.com or username"
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

            <div className="text-right mt-2 mb-4">
              <Link
                to="/forgot-password"
                className="text-xs text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              className="bg-blue-600 text-white mt-1 rounded-lg py-2.5 px-4 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-center text-sm w-full font-medium cursor-pointer transition-all"
              type="submit"
            >
              Login
            </button>

            <p className="text-xs text-gray-500 dark:text-slate-400 font-normal mt-4 text-center w-full">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-500 hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
    </div>
  );
}

export default LoginPage;
