package com.preptracker.server.dto;

// Top-level shape for the Confidence Explorer: the full category → topic →
// technique tree for the current user, each node carrying the user's average
// confidence and question count from their real attempts.

import java.util.List;

public record ConfidenceTreeDTO(
        List<ConfidenceNodeDTO> categories
) {
}
