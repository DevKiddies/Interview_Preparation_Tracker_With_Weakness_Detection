package com.preptracker.server.service;

import com.preptracker.server.dto.ConfidenceResult;
import com.preptracker.server.model.ConfidenceState;
import com.preptracker.server.model.QuestionType;
import org.springframework.stereotype.Service;

// Computes the confidence score and state for a single question attempt.
// The algorithm is intentionally simple and behavior-based:
//
//   base = 90
//     switches:   0 ->  0, 1 -> -5, 2 -> -12, 3 -> -20, 4+ -> -25
//     flagged:   yes -> -10
//     time:      FAST -> +10, NORMAL -> 0, SLOW -> -10
//     (clamped to 0..100)
//
//   state combines the score with correctness:
//     High + correct -> CONFIDENT_CORRECT
//     High + wrong   -> BLIND_SPOT
//     Low  + correct -> UNDERCONFIDENT_CORRECT
//     Low  + wrong   -> CLEAR_WEAKNESS
//
// An unanswered question never enters the algorithm: it has no observable
// confidence, so it is stored as score 0 with state NOT_ATTEMPTED.
//
// "Fast"/"slow" are defined per question type, because a snippet question
// (code comprehension) and a theory question have very different natural
// response times. Starting at 90 (not 100) makes the +10 fast bonus
// meaningful: perfect+fast = 100, perfect+normal = 90, perfect+slow = 80.
@Service
public class ConfidenceService {

    // High confidence means >= 70
    private static final int HIGH_CONFIDENCE_THRESHOLD = 70;

    // Switch penalties: index = number of switches, value = penalty
    private static final int[] SWITCH_PENALTIES = {0, -5, -12, -20, -25};

    private static final int FLAG_PENALTY = -10;
    private static final int FAST_BONUS = 10;
    private static final int SLOW_PENALTY = -10;

    // Time thresholds (seconds) that decide FAST / NORMAL / SLOW per question type
    private static final int THEORY_FAST_MAX_SECONDS = 10;
    private static final int THEORY_SLOW_MIN_SECONDS = 25;
    private static final int SNIPPET_FAST_MAX_SECONDS = 40;
    private static final int SNIPPET_SLOW_MIN_SECONDS = 90;

    public ConfidenceResult calculate(
            int switchCount,
            boolean isFlagged,
            int timeTakenSeconds,
            QuestionType questionType,
            boolean isCorrect,
            boolean isAnswered) {

        // No final answer -> no observable confidence.
        if (!isAnswered) {
            return new ConfidenceResult(0, ConfidenceState.NOT_ATTEMPTED);
        }

        int confidence = 90;

        confidence += switchPenalty(switchCount);
        if (isFlagged) {
            confidence += FLAG_PENALTY;
        }
        confidence += timeAdjustment(timeTakenSeconds, questionType);

        // Clamp to 0..100
        int score = Math.max(0, Math.min(100, confidence));
        ConfidenceState state = deriveState(score, isCorrect);

        return new ConfidenceResult(score, state);
    }

    private int switchPenalty(int switchCount) {
        if (switchCount <= 0) return SWITCH_PENALTIES[0];
        if (switchCount >= SWITCH_PENALTIES.length) return SWITCH_PENALTIES[SWITCH_PENALTIES.length - 1];
        return SWITCH_PENALTIES[switchCount];
    }

    private int timeAdjustment(int seconds, QuestionType questionType) {
        int fastMax = questionType == QuestionType.snippet ? SNIPPET_FAST_MAX_SECONDS : THEORY_FAST_MAX_SECONDS;
        int slowMin = questionType == QuestionType.snippet ? SNIPPET_SLOW_MIN_SECONDS : THEORY_SLOW_MIN_SECONDS;

        if (seconds < fastMax) return FAST_BONUS;
        if (seconds > slowMin) return SLOW_PENALTY;
        return 0;
    }

    private ConfidenceState deriveState(int score, boolean isCorrect) {
        boolean high = score >= HIGH_CONFIDENCE_THRESHOLD;
        if (high && isCorrect) return ConfidenceState.CONFIDENT_CORRECT;
        if (high) return ConfidenceState.BLIND_SPOT;
        if (isCorrect) return ConfidenceState.UNDERCONFIDENT_CORRECT;
        return ConfidenceState.CLEAR_WEAKNESS;
    }
}
