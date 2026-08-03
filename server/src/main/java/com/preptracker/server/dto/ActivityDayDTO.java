package com.preptracker.server.dto;

// One day of the profile "Study Consistency" heatmap. attempts = every logged
// attempt that day, questions = distinct questions actually answered (skips
// excluded), confidence/accuracy are the day's averages (null when there's no
// data to compute them), studyMinutes comes from test time logged that day.

public record ActivityDayDTO(
        String date,          // ISO yyyy-MM-dd
        int attempts,
        int questions,
        Integer confidence,   // 0-100, null if nothing answered that day
        Integer accuracy,     // 0-100, null if no attempts that day
        int studyMinutes
) {
}
