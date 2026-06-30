// DashboardPage.jsx — the main user dashboard.
// Fetches the logged-in user's profile on mount to personalise the header and sidebar,
// then assembles all the dashboard widgets (stats, charts, heatmap, recommendations).

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import WelcomeHeader from "../components/dashboard/WelcomeHeader";
import StatCard from "../components/dashboard/StatCard";
import DangerZoneAlert from "../components/dashboard/DangerZoneAlert";
import WeaknessRadarChart from "../components/dashboard/WeaknessRadarChart";
import ConfidenceAccuracyChart from "../components/dashboard/ConfidenceAccuracyChart";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";
import QuickActions from "../components/dashboard/QuickActions";
import RecommendedForYou from "../components/dashboard/RecommendedForYou";
import ProgressByTopic from "../components/dashboard/ProgressByTopic";
import API_BASE from "../utils/api.js";

import {
  dashboardStats,
  dangerZone,
  weaknessRadar,
  confidenceAccuracy,
  quickActions,
  recommendations,
  topicProgress,
} from "../data/dashboardData";

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

export default function DashboardPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [profile, setProfile] = useState(null);

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
  const focusTopics = profile?.focusTopics ?? [];

  return (
    <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <Sidebar
          username={username}
          targetLabel={targetLabel}
          experienceLabel={experienceLabel}
          daysLeft={daysLeft}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <WelcomeHeader
            firstName={username}
            daysLeft={daysLeft}
            targetLabel={targetLabel}
            experienceLabel={experienceLabel}
            onStartTest={() =>
              navigate("/practice/instructions", {
                state: {
                  nextUrl:     "/practice/mock-tests/dsa",
                  nextState:   null,
                  testTitle:   "DSA Fundamentals",
                  questions:   20,
                  timeMins:    90,
                  difficulty:  "Mixed",
                  description: "Arrays, HashMaps, Trees, Graphs, Sorting & Dynamic Programming",
                },
              })
            }
          />

          {focusTopics.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Your Focus Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {focusTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <StatCard key={stat.id} {...stat} />
            ))}
          </div>

          <DangerZoneAlert topic={dangerZone.topic} message={dangerZone.message} />

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WeaknessRadarChart data={weaknessRadar} />
            <ConfidenceAccuracyChart dataByRange={confidenceAccuracy} />
          </div>

          {/* Activity + Recommendations */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ActivityHeatmap
              footer={<QuickActions actions={quickActions} />}
            />
            <RecommendedForYou
              items={recommendations}
              onStart={(item) => {
                if (item.badge === "Mock Test") {
                  navigate("/practice/instructions", {
                    state: {
                      nextUrl:     "/practice/mock-tests/dsa",
                      nextState:   null,
                      testTitle:   item.title,
                      questions:   20,
                      timeMins:    90,
                      difficulty:  "Mixed",
                      description: item.description,
                    },
                  });
                } else {
                  navigate("/practice/mock-tests");
                }
              }}
              footer={<ProgressByTopic topics={topicProgress} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
