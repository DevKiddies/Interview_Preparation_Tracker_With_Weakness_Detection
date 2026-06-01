// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import SignUpVerification from "./components/SignUpVerification";
import OnBoardingPage from "./components/OnBoardingPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Root path automatically redirects users to the login screen */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. Authentication Application Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 3. Verification route accepts an optional email parameter via URL query.
           (e.g., /verify?email=user@example.com)
         */}
        <Route path="/verify" element={<SignUpVerification />} />

        {/* 4. Fallback 404 Route - Redirects back to login if path doesn't exist */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        {/* 5. Onboarding route for new users after successful signup */}
        <Route path="/onboarding" element={<OnBoardingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
