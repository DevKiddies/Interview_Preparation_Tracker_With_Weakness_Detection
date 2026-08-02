package com.preptracker.server.dto;

// One ranked row in the "Blind Spot Analysis" widget: a topic and how many times
// the user was overconfident on it (high confidence but answered wrong).

public record BlindSpotDTO(
        String topic,
        int count
) {
}
