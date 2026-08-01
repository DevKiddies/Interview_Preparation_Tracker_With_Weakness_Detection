package com.preptracker.server.dto;

import com.preptracker.server.model.ConfidenceState;

// Immutable result of ConfidenceService.calculate().
// Controllers stay unaware of how confidence works — they only ever see this.
public record ConfidenceResult(
        int confidenceScore,
        ConfidenceState confidenceState
) {}
