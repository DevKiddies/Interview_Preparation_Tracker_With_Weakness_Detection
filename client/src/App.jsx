import { Routes, Route } from "react-router-dom";
import {} from "react";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage.jsx";
import UserVerificationPage from "./pages/UserVerificationPage";
import OnBoardingPage from "./pages/OnBoardingPage.jsx";
import WorkInProgress from "./pages/WorkInProgress.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";

function GitHubCallback() {
  // ...unchanged...
}

const App = () => {
  const location = useLocation();

  // Routes where the navbar (and footer) should be hidden
 const hideLayout = ["/onboarding", "/admin/login"].includes(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {!hideLayout && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/signup" element={<SignUpPage />} />
<Route path="/verify" element={<UserVerificationPage />} />
<Route path="/onboarding" element={<OnBoardingPage />} />
<Route path="/auth/callback" element={<GitHubCallback />} />
<Route path="/dashboard" element={<WorkInProgress />} />
<Route path="/admin/login" element={<AdminLoginPage />} />
<Route path="/admin/dashboard" element={<WorkInProgress />} />
<Route path="*" element={<WorkInProgress />} />
        </Routes>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;
