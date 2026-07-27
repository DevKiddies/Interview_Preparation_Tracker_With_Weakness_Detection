// DashboardPage.jsx — the main user dashboard.
// Fetches the logged-in user's profile on mount to personalise the header and sidebar,
// then assembles all the dashboard widgets (stats, charts, heatmap, recommendations).

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";
import QuickActions from "../components/dashboard/QuickActions";
import PreparationCard from "../components/dashboard/PreparationCard";
import API_BASE from "../utils/api.js";
import ConfidenceByTopic from "../components/dashboard/ConfidenceByTopic";
import { topicConfidence } from "../data/dashboardData";
import { confidenceTrend } from "../data/dashboardData";
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
          <PreparationCard
              targetLabel={targetLabel}
              experienceLabel={experienceLabel}
              interviewDate={profile?.interviewDate}
              daysLeft={daysLeft}
              onStartTest={() =>
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
                  })
              }
          />
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Overall Confidence"
                value="78%"
                icon="brain"
                color="blue"
                change="+3%"
                trend="up"
                description="vs last week"
            />

            <StatCard
                title="Overall Accuracy"
                value="82%"
                icon="target"
                color="green"
                change="+2%"
                trend="up"
                description="vs last week"
            />

            <StatCard
                title="Questions Solved"
                value="1,247"
                icon="book"
                color="purple"
                change="+56"
                trend="up"
                description="this week"
            />

            <StatCard
                title="Study Streak"
                value="18 Days"
                icon="flame"
                color="orange"
                change="+2"
                trend="up"
                description="current streak"
            />
          </div>


          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ConfidenceByTopic topics={topicConfidence} />
            <ConfidenceTrend data={confidenceTrend} />
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
