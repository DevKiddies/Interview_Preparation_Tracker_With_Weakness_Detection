// dashboardCache.js — tiny localStorage cache for the current user's dashboard
// payload (stats, charts, heatmap).
//
// Why it exists: the dashboard widgets would otherwise render empty/fake data
// for the first network round trip on every navigation. Pages initialize their
// dashboard state from this cache (synchronously) and then refresh from the
// network, so the dashboard is stable across route changes — the same pattern
// as profileCache.

const KEY = "preptracker.dashboard";

export function getCachedDashboard() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedDashboard(payload) {
  if (!payload) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable — ignore */
  }
}
