package com.preptracker.server.dto;

// One row of the dashboard "Confidence/Accuracy by Category" widget: the user's
// average confidence in a category, its accuracy, how many weak-topic signals
// (BLIND_SPOT / CLEAR_WEAKNESS) it produced, a trend arrow vs the previous 7
// days, and how many questions were attempted there.

public record CategoryConfidenceDTO(
        Long id,
        String name,
        Integer confidence,
        Integer accuracy,
        int weakTopics,
        String trend,       // up | down | flat
        int questionCount
) {
}
