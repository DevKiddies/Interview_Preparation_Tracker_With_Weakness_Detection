// DashboardPage.jsx — the main user dashboard.
// Fetches the logged-in user's profile on mount to personalise the header and sidebar,
// then assembles all the dashboard widgets (stats, charts, heatmap, recommendations).

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Target, BarChart2 } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import ActivityHeatmap from "../components/profile/ActivityHeatmap";
import QuickActions from "../components/dashboard/QuickActions";
import PreparationCard from "../components/dashboard/PreparationCard";
import API_BASE from "../utils/api.js";
import { getInterviewClosed } from "../utils/interviewState";
import { getCachedProfile, setCachedProfile } from "../utils/profileCache";
import { getCachedDashboard, setCachedDashboard } from "../utils/dashboardCache";
import ConfidenceByCategory from "../components/dashboard/ConfidenceByCategory";
import ConfidenceTrend from "../components/dashboard/ConfidenceTrend";
import BlindSpotAnalysis from "../components/dashboard/BlindSpotAnalysis";
import { blindSpotData } from "../data/dashboardData";
import AccuracyHeatmap from "../components/dashboard/AccuracyHeatmap";
import { accuracyHeatmap } from "../data/dashboardData";

const TARGET_LABELS = {
  faang: "FAANG / Big Tech",
  product: "Product Companies",
  service: "Service Companies",
  competitive: "Competitive Exams",
};

const EXPERIENCE_LABELS = {
  fresher: "Student / Fresher",
  mid: "Mid-level",
  senior: "Senior",
};

function formatDelta(value, suffix = "%") {
  if (value === undefined || value === null) return null;
  return `${value > 0 ? "+" : ""}${value}${suffix}`;
}

function trendOf(value) {
  if (value === undefined || value === null || value === 0) return "neutral";
  return value > 0 ? "up" : "down";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [profile, setProfile] = useState(() => getCachedProfile());
  const [stats, setStats] = useState(() => getCachedDashboard()?.stats ?? null);
  const [categories, setCategories] = useState(() => getCachedDashboard()?.categories ?? []);
  const [trend, setTrend] = useState(() => getCachedDashboard()?.trend ?? null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setUsername(data.username);
            localStorage.setItem("username", data.username);
          }
          if (data.avatarUrl) {
            localStorage.setItem("avatarUrl", data.avatarUrl);
          }
          // Notify the Navbar to refresh the avatar and username without a page reload.
          window.dispatchEvent(new CustomEvent("user-profile-updated"));
          setProfile(data);
          setCachedProfile(data);
        })
        .catch(() => {});

    fetch(`${API_BASE}/api/users/me/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
          setStats(data);
          setCachedDashboard({ ...getCachedDashboard(), stats: data });
        })
        .catch(() => {});

    fetch(`${API_BASE}/api/users/me/dashboard/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
          if (Array.isArray(data)) {
            setCategories(data);
            setCachedDashboard({ ...getCachedDashboard(), categories: data });
          }
        })
        .catch(() => {});

    fetch(`${API_BASE}/api/users/me/dashboard/trend`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
          setTrend(data);
          setCachedDashboard({ ...getCachedDashboard(), trend: data });
        })
        .catch(() => {});
  }, []);

  // Calculate whole days remaining until the interview date.
  // Zero out hours on both dates so we compare calendar days, not timestamps.
  const daysLeft = useMemo(() => {
    if (!profile?.interviewDate) return null;
    const target = new Date(profile.interviewDate);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff >= 0 ? diff : 0;
  }, [profile?.interviewDate]);

  const targetLabel = TARGET_LABELS[profile?.targetCompany] ?? null;
  const experienceLabel = EXPERIENCE_LABELS[profile?.experienceLevel] ?? null;

  // Determine status and dynamic action button config for PreparationCard
  const prepCardStatus = useMemo(() => {
    if (getInterviewClosed()) return "EMPTY";
    if (!profile?.interviewDate) return "EMPTY";
    return daysLeft === 0 ? "COMPLETED" : "ACTIVE";
  }, [profile?.interviewDate, daysLeft]);

  const prepCardAction = useMemo(() => {
    if (prepCardStatus === "COMPLETED") {
      return {
        label: "Result",
        icon: <BarChart2 size={16} />,
        onClick: () => navigate("/interview-settings"),
      };
    }

    if (prepCardStatus === "EMPTY") {
      return {
        label: "Set Goal",
        icon: <Target size={15} />,
        onClick: () => navigate("/interview-settings"),
      };
    }

    // Default ACTIVE status
    return {
      label: "Start",
      icon: <Play size={14} fill="currentColor" />,
      onClick: () =>
          navigate("/practice/instructions", {
            state: {
              nextUrl: "/practice/mock-tests/dsa",
              nextState: null,
              testTitle: "DSA Fundamentals",
              questions: 20,
              timeMins: 90,
              difficulty: "Mixed",
              description:
                  "Arrays, HashMaps, Trees, Graphs, Sorting & Dynamic Programming",
            },
          }),
    };
  }, [prepCardStatus, navigate]);

  return (
      <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar
              username={username}
              targetLabel={targetLabel}
              experienceLabel={experienceLabel}
          />

          <div className="min-w-0 flex-1 space-y-6">
            {/* Universal Current Interview Card */}
            <PreparationCard
                targetLabel={targetLabel}
                experienceLabel={experienceLabel}
                interviewDate={profile?.interviewDate}
                daysLeft={daysLeft}
                status={prepCardStatus}
                action={prepCardAction}
            />

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                  title="Overall Confidence"
                  value={stats?.overallConfidence != null ? `${stats.overallConfidence}%` : "—"}
                  icon="brain"
                  color="blue"
                  change={formatDelta(stats?.confidenceDelta)}
                  trend={trendOf(stats?.confidenceDelta)}
                  description="vs last week"
              />

              <StatCard
                  title="Overall Accuracy"
                  value={stats?.overallAccuracy != null ? `${stats.overallAccuracy}%` : "—"}
                  icon="target"
                  color="green"
                  change={formatDelta(stats?.accuracyDelta)}
                  trend={trendOf(stats?.accuracyDelta)}
                  description="vs last week"
              />

              <StatCard
                  title="Questions Solved"
                  value={stats?.questionsSolved != null ? stats.questionsSolved.toLocaleString() : "—"}
                  icon="book"
                  color="purple"
                  change={stats?.solvedThisWeek != null ? formatDelta(stats.solvedThisWeek, "") : null}
                  trend="neutral"
                  description="this week"
              />

              <StatCard
                  title="Study Streak"
                  value={stats?.studyStreak != null ? `${stats.studyStreak} Days` : "—"}
                  icon="flame"
                  color="orange"
                  change={null}
                  description="current streak"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ConfidenceByCategory topics={categories} />
              <ConfidenceTrend data={trend ?? {}} />
            </div>

            {/* Charts Row 2 — Side by Side Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <BlindSpotAnalysis data={blindSpotData} />
              <AccuracyHeatmap data={accuracyHeatmap} />
            </div>
          </div>
        </div>
      </div>
  );
}