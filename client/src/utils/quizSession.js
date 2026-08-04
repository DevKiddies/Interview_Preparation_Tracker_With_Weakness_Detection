// quizSession.js — a lightweight client-side "active test session" marker.
// A quiz may only be entered (and its questions fetched/started) when a
// matching session marker exists. The marker is created only by deliberate
// entry points ("Begin assessment" on the instructions page, or a Retake)
// and cleared when the test is submitted. This blocks:
//   - manual URL entry into /practice/mock-tests/:testId
//   - re-entering a finished test by pressing Back from the results page
// sessionStorage survives reloads and tab-session restore (Ctrl+Shift+T), so
// an in-progress quiz still resumes from its cache the way it always did.

const ACTIVE_KEY = "prepedge-active-test";

export function startActiveTestSession(testId) {
  try {
    sessionStorage.setItem(ACTIVE_KEY, JSON.stringify({ testId, startedAt: Date.now() }));
  } catch {
    // ignore: sessionStorage unavailable (private mode/quota) — guard stays permissive
  }
}

export function clearActiveTestSession() {
  try {
    sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    // ignore: nothing to clear if sessionStorage is unavailable
  }
}

export function isValidActiveTestSession(testId) {
  try {
    const raw = sessionStorage.getItem(ACTIVE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.testId === testId);
  } catch {
    // ignore: malformed/missing marker treated as not active
    return false;
  }
}
