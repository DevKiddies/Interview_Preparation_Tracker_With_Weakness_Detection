// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Shared Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages & Feature Components
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage.jsx";
import UserVerificationPage from "./pages/UserVerificationPage";
import OnBoardingPage from "./pages/OnBoardingPage.jsx";
import WorkInProgress from "./pages/WorkInProgress.jsx";
const App = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Global Header Layout Component from Suhani's Branch */}
      <Navbar />
      
      {/* Dynamic Route Content Block */}
      <main className="flex-grow">
        <Routes>
          {/* 1. Public Marketing Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Authentication Flow Channels */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify" element={<UserVerificationPage />} />

          {/* 3. Personalized User Onboarding Wizard */}
          <Route path="/onboarding" element={<OnBoardingPage />} />

          {/* 4. Global Fallback Route (Ensures broken paths loop safely to root) */}
            <Route path="*" element={<WorkInProgress />} />
        </Routes>
      </main>

      {/* Global Footer Layout Component from Suhani's Branch */}
      <Footer />
    </div>
  );
};

export default App;