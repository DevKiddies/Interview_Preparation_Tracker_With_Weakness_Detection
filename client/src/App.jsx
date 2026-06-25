import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const UserVerificationPage = lazy(() => import("./pages/UserVerificationPage"));
const OnBoardingPage = lazy(() => import("./pages/OnBoardingPage"));
const WorkInProgress = lazy(() => import("./pages/WorkInProgress"));
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

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") && location.pathname !== "/admin/login";
  const hideLayout = ["/onboarding"].includes(location.pathname) || isAdminRoute;

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
            <Route path="/dashboard" element={<WorkInProgress />} />
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
      {!hideLayout && <Footer />}
    </div>
  );
};

export default App;

