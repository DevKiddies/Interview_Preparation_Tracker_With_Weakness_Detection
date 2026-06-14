import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage.jsx";
import UserVerificationPage from "./pages/UserVerificationPage";
import OnBoardingPage from "./pages/OnBoardingPage.jsx";
import WorkInProgress from "./pages/WorkInProgress.jsx";

function GitHubCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      navigate("/login?error=github_login_failed", { replace: true });
      return;
    }

    localStorage.setItem("token", token);

    fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((me) => {
        navigate(me.onboarded ? "/dashboard" : "/onboarding", { replace: true });
      })
      .catch(() => {
        navigate("/login?error=something_went_wrong", { replace: true });
      });
  }, [location.search, navigate]);

  return <p className="text-center mt-20 text-gray-500">Signing you in...</p>;
}

const App = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify" element={<UserVerificationPage />} />
          <Route path="/onboarding" element={<OnBoardingPage />} />
          <Route path="/auth/callback" element={<GitHubCallback />} />
          <Route path="/dashboard" element={<WorkInProgress />} />
          <Route path="*" element={<WorkInProgress />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;