package com.preptracker.server.dto;

// One row of the admin dashboard's "Recent Activity" feed, built from real
// persisted rows (new signups, completed test attempts, applied bans).
// `time` is a human-friendly relative timestamp ("5 min ago") computed
// server-side from the original event timestamp.
public record RecentActivityDTO(
        String type,      // "user_registered" | "test_completed" | "user_banned"
        String message,
        String detail,
        String time,
        String status     // "success" | "warning" | "info"
) {}
