// App.jsx — root component that owns all route definitions.
// Navbar and Footer are conditionally hidden on full-screen pages (quiz, onboarding, admin).

import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// All pages are lazy-loaded — React only downloads the JS for a page when
// the user navigates to it, keeping the initial bundle small.
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const UserVerificationPage = lazy(() => import("./pages/UserVerificationPage"));
const OnBoardingPage = lazy(() => import("./pages/OnBoardingPage"));
const WorkInProgress = lazy(() => import("./pages/WorkInProgress"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPages"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const OurTeamPage = lazy(() => import("./pages/OurTeamPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQsPage = lazy(() => import("./pages/FAQsPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));

const MockTestPage           = lazy(() => import("./pages/MockTestPage"));
const MockTestSelectionPage  = lazy(() => import("./pages/MockTestSelectionPage"));
const TopicTestConfigPage    = lazy(() => import("./pages/TopicTestConfigPage"));
const TestResultPage         = lazy(() => import("./pages/TestResultPage"));
const TestInstructionsPage   = lazy(() => import("./pages/TestInstructionsPage"));
const ProfilePage            = lazy(() => import("./pages/ProfilePage"));

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  return token ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}

const App = () => {
  const location = useLocation();
  const isAdminRoute =
    location.pathname.startsWith("/admin") &&
    location.pathname !== "/admin/login";

  // Navbar and Footer are hidden inside the test flow and on admin pages,
  // but not on the test-selection page so users can still navigate away.
  const hideLayout =
    ["/onboarding"].includes(location.pathname) ||
    location.pathname.startsWith("/practice/mock-tests/") ||
    location.pathname === "/practice/results" ||
    isAdminRoute;

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      <ScrollToTop />
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile/settings" element={<ProfilePage />} />

            <Route path="/practice/mock-tests" element={<ProtectedRoute><MockTestSelectionPage /></ProtectedRoute>} />
            <Route path="/practice/mock-tests/:testId" element={<ProtectedRoute><MockTestPage /></ProtectedRoute>} />
            <Route path="/practice/topic-test" element={<ProtectedRoute><TopicTestConfigPage /></ProtectedRoute>} />
            <Route path="/practice/instructions" element={<ProtectedRoute><TestInstructionsPage /></ProtectedRoute>} />
            <Route path="/practice/results" element={<ProtectedRoute><TestResultPage /></ProtectedRoute>} />

            <Route path="/resources/interview-experiences" element={<ProtectedRoute><WorkInProgress /></ProtectedRoute>} />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<WorkInProgress />} />
            <Route path="/admin/users" element={<WorkInProgress />} />
            <Route path="/admin/questions" element={<WorkInProgress />} />
            <Route path="/admin/tests" element={<WorkInProgress />} />
            <Route path="/about/us" element={<AboutUsPage />} />
            <Route path="/about/team" element={<OurTeamPage />} />
            <Route path="/about/contact" element={<ContactPage />} />
            <Route path="/help/faqs" element={<FAQsPage />} />
            <Route path="/help/support" element={<SupportPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="*" element={<WorkInProgress />} />
          </Routes>
        </Suspense>
      </main>
      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;
