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

const MockTestPage = lazy(() => import("./pages/MockTestPage"));
const MockTestSelectionPage = lazy(
  () => import("./pages/MockTestSelectionPage"),
);
const TopicTestConfigPage = lazy(() => import("./pages/TopicTestConfigPage"));
const TestResultPage = lazy(() => import("./pages/TestResultPage"));
const TestInstructionsPage = lazy(() => import("./pages/TestInstructionsPage"));
const ProfilePage            = lazy(() => import("./pages/ProfilePage"));
const InterviewPage          = lazy(() => import("./pages/InterviewPage"));
const InterviewHistoryPage   = lazy(() => import("./pages/InterviewHistoryPage"));
const MockTestHistoryPage    = lazy(() => import("./pages/MockTestHistoryPage"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminComingSoon = lazy(() => import("./pages/admin/AdminComingSoon"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBannedUsers = lazy(() => import("./pages/admin/AdminBannedUsers"));
const AdminAllUsers = lazy(() => import("./pages/admin/AdminAllUsers"));
const AdminUserResults = lazy(() => import("./pages/admin/AdminUserResults"));
const AdminQuestionBank = lazy(() => import("./pages/admin/AdminQuestionBank"));
const AdminAddQuestion = lazy(() => import("./pages/admin/AdminAddQuestion"));
const AdminCategoriesTopics = lazy(
  () => import("./pages/admin/AdminCategoriesTopics"),
);
const AdminAllTests = lazy(() => import("./pages/admin/AdminAllTests"));
const AdminCreateMockTest = lazy(
  () => import("./pages/admin/AdminCreateMockTest"),
);
const AdminTestResults = lazy(() => import("./pages/admin/AdminTestResults"));
const AdminPlatformOverview = lazy(
  () => import("./pages/admin/AdminPlatformOverview"),
);
const AdminUserReports = lazy(() => import("./pages/admin/AdminUserReports"));
const AdminWeaknessAnalysis = lazy(
  () => import("./pages/admin/AdminWeaknessAnalysis"),
);
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();
  return token ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location.pathname }} replace />
  );
}

function AdminProtectedRoute({ children }) {
  const adminToken = localStorage.getItem("adminToken");
  const location = useLocation();
  return adminToken ? children : <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
}

const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

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
            <Route path="/interview-settings" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
            <Route path="/interview-history" element={<ProtectedRoute><InterviewHistoryPage /></ProtectedRoute>} />
            <Route path="/history/interview/:interviewId/tests" element={<ProtectedRoute><MockTestHistoryPage /></ProtectedRoute>} />

            <Route
              path="/practice/mock-tests"
              element={
                <ProtectedRoute>
                  <MockTestSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice/mock-tests/:testId"
              element={
                <ProtectedRoute>
                  <MockTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice/topic-test"
              element={
                <ProtectedRoute>
                  <TopicTestConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice/instructions"
              element={
                <ProtectedRoute>
                  <TestInstructionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice/results"
              element={
                <ProtectedRoute>
                  <TestResultPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resources/interview-experiences"
              element={
                <ProtectedRoute>
                  <WorkInProgress />
                </ProtectedRoute>
              }
            />

            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />

              {/* User Management */}
              <Route path="users" element={<AdminAllUsers />} />
              <Route path="users/results" element={<AdminUserResults />} />
              <Route path="users/banned" element={<AdminBannedUsers />} />
              <Route
                path="users/:userId"
                element={<AdminComingSoon title="User Details" />}
              />

              {/* Question Management */}
              <Route path="questions" element={<AdminQuestionBank />} />
              <Route path="questions/add" element={<AdminAddQuestion />} />
              <Route
                path="questions/categories"
                element={<AdminCategoriesTopics />}
              />
              <Route
                path="questions/edit/:id"
                element={<AdminComingSoon title="Edit Question" />}
              />

              {/* Test Management */}
              <Route path="tests" element={<AdminAllTests />} />
              <Route path="tests/create" element={<AdminCreateMockTest />} />
              <Route path="tests/results" element={<AdminTestResults />} />

              {/* Analytics */}
              <Route path="analytics" element={<AdminPlatformOverview />} />
              <Route path="analytics/users" element={<AdminUserReports />} />
              <Route
                path="analytics/weaknesses"
                element={<AdminWeaknessAnalysis />}
              />

              {/* Settings */}
              <Route path="settings" element={<AdminSettings />} />
            </Route>
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
