// BanGuard.jsx — renders nothing, just watches for a mid-session ban.
// While a token is present, polls a cheap authenticated endpoint every 30s.
// JwtFilter on the backend rejects every request from a banned user with 403
// (see BannedUserService) — this is what actually notices that 403, force-logs
// the user out locally, and redirects to /login with the ban message, instead
// of leaving a banned user's tab looking normal until they happen to click
// something that fails.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../utils/api.js";

const POLL_INTERVAL_MS = 30000;

export default function BanGuard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkBanStatus = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      fetch(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.status !== 403) return;
          return res.text().then((message) => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("avatarUrl");
            window.dispatchEvent(new CustomEvent("user-profile-updated"));
            navigate("/login", {
              state: {
                banned: true,
                message: message || "Your account has been banned. Please contact administration.",
              },
            });
          });
        })
        .catch(() => {
          // silent — network hiccup, next interval will retry
        });
    };

    checkBanStatus();
    const interval = setInterval(checkBanStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [navigate]);

  return null;
}
