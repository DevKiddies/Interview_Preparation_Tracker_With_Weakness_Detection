import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

    fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((me) => {
        navigate(me.onboarded ? "/dashboard" : "/onboarding");
      })
      .catch(() => {
        navigate("/login?error=something_went_wrong");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}

export default AuthCallbackPage;