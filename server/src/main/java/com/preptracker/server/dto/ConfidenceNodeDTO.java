package com.preptracker.server.dto;

// One node of the Confidence Explorer tree. level is category | topic |
// technique so the frontend can render the right column set without extra
// lookups. children only exist for category/topic levels.

import java.util.List;

public record ConfidenceNodeDTO(
        Long id,
        String name,
        String level,          // category | topic | technique
        Integer confidence,    // 0-100, null when the user has no attempts here
        int questionCount,
        List<ConfidenceNodeDTO> children
) {
}
