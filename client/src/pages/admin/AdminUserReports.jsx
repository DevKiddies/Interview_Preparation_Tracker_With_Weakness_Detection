// AdminUserReports.jsx — Analytics & Reports > User Reports page.
// User-centric analytics: growth chart, demographics breakdown (experience level,
// auth provider, target company), engagement tiers, and top performers leaderboard.

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, UserPlus, TrendingUp, Flame, Trophy, Star, Zap,
  Mail, Code2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  monthlyGrowthData, experienceLevelData, authProviderData,
  targetCompanyData, engagementTiers, topPerformersData,
} from "../../data/adminAnalyticsData";
import { TOPIC_COLORS } from "../../data/adminTestsData";

const RANK_ICONS = [Trophy, Star, Zap];

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 shrink-0`}>
        <Icon size={20} className={`text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-3 py-2 rounded-xl shadow-xl border text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <strong>{p.value.toLocaleString()}</strong></p>
      ))}
    </div>
  );
};

export default function AdminUserReports() {
  const { isDark } = useTheme();
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#f1f5f9";

  const totalUsers = monthlyGrowthData[monthlyGrowthData.length - 1].totalUsers;
  const newThisMonth = monthlyGrowthData[monthlyGrowthData.length - 1].newUsers;
  const totalEngaged = engagementTiers.filter(t => t.tier !== "Inactive").reduce((s, t) => s + t.count, 0);
  const totalEngagementCount = engagementTiers.reduce((s, t) => s + t.count, 0);
  const retentionRate = ((totalEngaged / totalEngagementCount) * 100).toFixed(1);

  const maxCompany = Math.max(...targetCompanyData.map(d => d.count));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="text-indigo-500" size={26} /> User Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Demographics, engagement, and performance across all registered users.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"     value={totalUsers.toLocaleString()} sub="all time"              icon={Users}     color="blue"   />
        <StatCard label="New This Month"  value={`+${newThisMonth}`}          sub="June 2024"             icon={UserPlus}  color="green"  />
        <StatCard label="Retention Rate"  value={`${retentionRate}%`}         sub="took at least 1 test"  icon={TrendingUp} color="indigo" />
        <StatCard label="Avg Tests/User"  value="3.7"                         sub="last 30 days"          icon={Flame}     color="amber"  />
      </div>

      {/* User Growth Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-0.5">User Growth</h3>
        <p className="text-xs text-slate-400 mb-4">Monthly new registrations over 12 months</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyGrowthData}>
            <defs>
              <linearGradient id="newUsersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="totalUsersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Area type="monotone" dataKey="totalUsers" name="Total Users" stroke="#3b82f6" strokeWidth={2} fill="url(#totalUsersGrad)" dot={false} />
            <Area type="monotone" dataKey="newUsers"   name="New Users"   stroke="#6366f1" strokeWidth={2} fill="url(#newUsersGrad)"   dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-5 mt-2 justify-center">
          {[["#3b82f6","Total Users"],["#6366f1","New Users"]].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-3 h-0.5 rounded" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Demographics row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Experience Level Pie */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">Experience Level</h3>
          <p className="text-xs text-slate-400 mb-3">User self-reported level</p>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={experienceLevelData}
                dataKey="count"
                nameKey="level"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={3}
              >
                {experienceLevelData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: isDark ? "#1e293b" : "#fff", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                formatter={(v, n) => [v.toLocaleString() + " users", n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {experienceLevelData.map(d => (
              <div key={d.level} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="flex-1">{d.level}</span>
                <span className="font-semibold text-slate-800 dark:text-white">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Provider */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">Sign-up Method</h3>
          <p className="text-xs text-slate-400 mb-4">How users registered</p>
          <div className="space-y-4">
            {authProviderData.map(d => {
              const pct = ((d.count / totalUsers) * 100).toFixed(1);
              const Icon = d.provider === "GitHub" ? Code2 : Mail;
              return (
                <div key={d.provider}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                      <Icon size={13} style={{ color: d.color }} />
                      {d.provider}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white">{d.count} · {pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: d.color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-5">Some users use multiple providers</p>
        </div>

        {/* Target Company */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">Target Companies</h3>
          <p className="text-xs text-slate-400 mb-4">User interview goals</p>
          <div className="space-y-2.5">
            {targetCompanyData.map(d => (
              <div key={d.company} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-20 shrink-0">{d.company}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className="h-2 rounded-full bg-blue-500 dark:bg-blue-400 transition-all" style={{ width: `${(d.count / maxCompany) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Tiers */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-white mb-1">User Engagement Tiers</h3>
        <p className="text-xs text-slate-400 mb-4">Segmented by number of tests completed</p>
        {/* Stacked bar */}
        <div className="flex rounded-xl overflow-hidden h-5 mb-4">
          {engagementTiers.map(t => {
            const pct = ((t.count / totalEngagementCount) * 100).toFixed(1);
            return (
              <div key={t.tier} style={{ width: `${pct}%`, background: t.color }} title={`${t.tier}: ${t.count} users (${pct}%)`} />
            );
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {engagementTiers.map(t => {
            const pct = ((t.count / totalEngagementCount) * 100).toFixed(1);
            return (
              <div key={t.tier} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2" style={{ background: t.color }} />
                <p className="text-sm font-bold text-slate-900 dark:text-white">{t.count}</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{t.tier}</p>
                <p className="text-xs text-slate-400">{t.desc}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Top Performers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {["Rank", "User", "Top Topic", "Tests", "Avg Score", "Streak"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {topPerformersData.map(u => {
                const topicColor = TOPIC_COLORS[u.topic];
                const RankIcon = u.rank <= 3 ? RANK_ICONS[u.rank - 1] : null;
                return (
                  <tr key={u.rank} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="px-5 py-3">
                      {RankIcon
                        ? <RankIcon size={16} className={u.rank === 1 ? "text-amber-500" : u.rank === 2 ? "text-blue-400" : "text-teal-500"} />
                        : <span className="text-slate-400 font-mono text-xs">#{u.rank}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      {topicColor && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${topicColor.bg} ${topicColor.text}`}>{u.topic}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{u.tests}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${u.avgScore}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-white">{u.avgScore}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-orange-500 font-semibold text-sm">
                        <Flame size={13} />{u.streak}d
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
