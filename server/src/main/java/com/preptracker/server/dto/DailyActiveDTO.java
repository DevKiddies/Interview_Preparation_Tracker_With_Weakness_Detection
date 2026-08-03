package com.preptracker.server.dto;

// One day of the admin dashboard's "Daily Active Users" series: how many users
// had a last_active_at timestamp on that day.
public record DailyActiveDTO(String day, long active) {}
