// profileCache.js — tiny localStorage cache for the current user's profile.
//
// Why it exists: the sidebar renders an interview-prep widget that depends on
// profile.interviewDate (via daysLeft). Without this cache every page starts
// with profile=null, so the widget is hidden on the first frame and only pops in
// once /api/users/me resolves — causing a visible flash on every navigation.
// Pages initialize their profile state from this cache (synchronously) and then
// refresh it from the network, so the sidebar is stable across route changes.

const KEY = "preptracker.profile";

export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedProfile(profile) {
  if (!profile) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function clearCachedProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
