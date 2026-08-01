package com.preptracker.server.dto;

// Per-topic focus tracker row for one of the user's selected focus topics.
// accuracy/confidence are null when the user has no attempts for the topic yet.
// state is one of: ON_TRACK (accuracy >= 60), WEAK (accuracy < 60),
// NO_DATA (no attempts for this topic yet).
public record FocusTopicStatDTO(
        String topic,
        long attempts,
        Integer accuracy,
        Integer confidence,
        String state
) {}
