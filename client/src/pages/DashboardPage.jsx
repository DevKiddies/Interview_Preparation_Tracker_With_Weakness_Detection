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

import {
  userProfile,
  dashboardStats,
  dangerZone,
  weaknessRadar,
  confidenceAccuracy,
  activityHeatmap,
  quickActions,
  recommendations,
  topicProgress,
} from "../data/dashboardData";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <Sidebar />

        <div className="min-w-0 flex-1 space-y-6">
          <WelcomeHeader
            firstName={userProfile.firstName}
            daysLeft={userProfile.daysLeft}
          />

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
              weeks={activityHeatmap}
              footer={<QuickActions actions={quickActions} />}
            />
            <RecommendedForYou
              items={recommendations}
              footer={<ProgressByTopic topics={topicProgress} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
