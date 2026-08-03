package com.preptracker.server.dto;

// One topic row in the "Accuracy Heatmap" widget. easy/medium/hard are the user's
// accuracy percentages per difficulty (0-100); each is null when the user hasn't
// attempted any questions of that difficulty for the topic (rendered as "—").

public record AccuracyHeatmapRowDTO(
        String topic,
        Integer easy,
        Integer medium,
        Integer hard
) {
}
