package com.preptracker.server.dto;

// Generic "how many users fall into this bucket" row — reused for experience
// level, sign-up method, target company, and engagement-tier breakdowns on the
// admin User Reports page. key is the raw stored value (or a fixed tier name);
// the frontend maps it to a display label/color.
public record CountBreakdownDTO(String key, long count) {}
