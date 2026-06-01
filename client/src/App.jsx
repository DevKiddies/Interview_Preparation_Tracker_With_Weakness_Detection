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
// Import the Home component (Placeholder for your teammate's branch sync)
import HomePage from "./components/HomePage"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Root path automatically redirects users to the login screen */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. Authentication Application Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* 3. Verification route */}
        <Route path="/verify" element={<SignUpVerification />} />

        {/* 4. Onboarding route for new users after successful signup */}
        <Route path="/onboarding" element={<OnBoardingPage />} />

        {/* 5. Main Platform Landing/Dashboard (Pulled from your teammate's branch) */}
        <Route path="/dashboard" element={<HomePage />} />

        {/* 6. CRITICAL FALLBACK (MUST BE LAST): 
             Catches unknown routes and handles redirection without breaking real paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;