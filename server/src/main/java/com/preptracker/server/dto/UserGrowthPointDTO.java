package com.preptracker.server.dto;

// One month of the admin User Reports growth chart: how many users signed up
// that month, and the cumulative total as of the end of that month.
public record UserGrowthPointDTO(String month, long newUsers, long totalUsers) {}
