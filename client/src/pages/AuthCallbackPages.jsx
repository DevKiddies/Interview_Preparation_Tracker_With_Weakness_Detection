import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE from "../utils/api.js";

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

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
        navigate(me.onboarded ? "/dashboard" : "/onboarding");
      })
      .catch(() => {
        navigate("/login?error=something_went_wrong");
      });
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}

export default AuthCallbackPage;