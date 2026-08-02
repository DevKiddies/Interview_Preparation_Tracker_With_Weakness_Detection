package com.preptracker.server.dto;

// One point on the Confidence & Accuracy trend chart. confidence and accuracy
// are 0-100; either may be null for a bucket with no (relevant) attempts so the
// chart can render a gap instead of a misleading zero.

public record TrendPointDTO(
        String label,
        Integer confidence,
        Integer accuracy
) {
}
