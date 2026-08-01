const KEY = "preptracker.interview.closed";

export function getInterviewClosed() {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
}

export function setInterviewClosed(result) {
    try {
        localStorage.setItem(KEY, result);
    } catch {
        /* ignore */
    }
}

export function clearInterviewClosed() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
}
