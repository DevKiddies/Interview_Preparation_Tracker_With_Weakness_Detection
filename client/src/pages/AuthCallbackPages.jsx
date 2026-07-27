// AuthCallbackPages.jsx — landing page for GitHub OAuth redirects.
// After the user approves GitHub access, the server exchanges the code for a JWT
// and redirects here as /auth/callback?token=<jwt>. We pick up the token,
// store it, and forward the user to onboarding or dashboard.

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE from "../utils/api.js";

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error"); // server populates this if something went wrong

    if (error || !token) {
      navigate("/login?error=github_login_failed");
      return;
    }

    localStorage.setItem("token", token);

    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((me) => {
        if (me.username) localStorage.setItem("username", me.username);
        if (me.avatarUrl) localStorage.setItem("avatarUrl", me.avatarUrl);
        window.dispatchEvent(new CustomEvent("user-profile-updated"));
        navigate(me.onboarded ? "/dashboard" : "/onboarding");
      })
      .catch(() => {
        navigate("/login?error=something_went_wrong");
      });
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-200">
      <p className="text-gray-500 dark:text-slate-400 text-sm">Signing you in...</p>
    </div>
  );
}

export default AuthCallbackPage;