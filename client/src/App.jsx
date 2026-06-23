import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const UserVerificationPage = lazy(() => import("./pages/UserVerificationPage"));
const OnBoardingPage = lazy(() => import("./pages/OnBoardingPage"));
const WorkInProgress = lazy(() => import("./pages/WorkInProgress"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPages"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const OurTeamPage = lazy(() => import("./pages/OurTeamPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQsPage = lazy(() => import("./pages/FAQsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));

// 1. ADD LAZY IMPORT FOR MOCK TEST PAGE
const MockTestPage = lazy(() => import("./pages/MockTestPage"));

const App = () => {
  const location = useLocation();
  
  // 2. ADD "/practice/mock-tests" HERE TO HIDE THE GLOBAL NAVBAR & FOOTER
const hideLayout = ["/onboarding"].includes(location.pathname) || location.pathname.startsWith("/practice/mock-tests");

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      {!hideLayout && <Navbar />}
      <main className="grow">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify" element={<UserVerificationPage />} />
            <Route path="/onboarding" element={<OnBoardingPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<WorkInProgress />} />
            
            {/* 3. ADD THE MOCK TEST ROUTE SEGMENT */}
            <Route path="/practice/mock-tests/:testId" element={<MockTestPage />} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<WorkInProgress />} />
            <Route path="/about/us" element={<AboutUsPage />} />
            <Route path="/about/team" element={<OurTeamPage />} />
            <Route path="/about/contact" element={<ContactPage />} />
            <Route path="/help/faqs" element={<FAQsPage />} />
            <Route path="/help/support" element={<SupportPage />} />
            <Route path="*" element={<WorkInProgress />} />
          </Routes>
        </Suspense>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;