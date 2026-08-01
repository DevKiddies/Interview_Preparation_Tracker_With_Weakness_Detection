package com.preptracker.server.model;

// The confidence states produced by ConfidenceService.
// Derived by combining the behavioral confidence score with whether the
// question was answered correctly:
//   High + correct  -> CONFIDENT_CORRECT
//   High + wrong    -> BLIND_SPOT          (thinks they know it, but don't)
//   Low  + correct  -> UNDERCONFIDENT_CORRECT
//   Low  + wrong    -> CLEAR_WEAKNESS
//   Unanswered      -> NOT_ATTEMPTED       (no observable confidence; excluded from averages)
public enum ConfidenceState {
    CONFIDENT_CORRECT,
    BLIND_SPOT,
    UNDERCONFIDENT_CORRECT,
    CLEAR_WEAKNESS,
    NOT_ATTEMPTED
}
