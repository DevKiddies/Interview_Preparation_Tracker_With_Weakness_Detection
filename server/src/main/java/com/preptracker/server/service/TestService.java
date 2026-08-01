package com.preptracker.server.service;

// Business logic behind POST /api/tests/submit.
// Extracted from the original TestController so the controller stays thin and
// the flow is easy to reason about:
//
//   for each question:
//     grade it (server-side, answers never leave the server)
//     compute confidence via ConfidenceService
//     build a UserAttempt (behavioral detail per question)
//   save the TestAttempt summary FIRST (so we have its generated id)
//   then save all UserAttempt rows referencing that test_attempt_id
//   return the detailed result
//
// Order matters: TestAttempt is saved before the child UserAttempt rows because
// the children need its generated id. Both writes share one transaction so a
// failure can't orphan user_attempts without a test_attempt.

import com.preptracker.server.dto.TestResultResponse;
import com.preptracker.server.dto.TestSubmissionRequest;
import com.preptracker.server.model.Question;
import com.preptracker.server.model.Technique;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.UserAttempt;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.UserAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TestService {

    private final QuestionRepository questionRepository;
    private final TestAttemptRepository testAttemptRepository;
    private final UserAttemptRepository userAttemptRepository;
    private final ConfidenceService confidenceService;

    @Transactional
    public TestResultResponse submitTest(TestSubmissionRequest request) {
        UUID userId = authenticatedUserId();
        List<Question> fetched = questionRepository.findAllById(request.questionIds());

        Map<Long, Question> byId = new HashMap<>();
        for (Question q : fetched) byId.put(q.getId(), q);

        // Flagged ids, switch counts and per-question times are optional in the
        // payload; default them so old clients and null-safe code stay correct.
        List<Long> flaggedIds = request.flaggedIds() != null ? request.flaggedIds() : List.of();
        Map<Long, Integer> switchCounts = request.switchCounts() != null ? request.switchCounts() : Map.of();
        Map<Long, Integer> questionTime = request.questionTime() != null ? request.questionTime() : Map.of();

        int score = 0;
        List<TestResultResponse.QuestionResult> results = new ArrayList<>();
        Map<String, int[]> catMap = new LinkedHashMap<>();
        List<UserAttempt> userAttempts = new ArrayList<>();

        // Iterate in the original question order (not the DB fetch order) to build
        // the results list in the same sequence the user saw during the test.
        int sequence = 0;
        for (Long id : request.questionIds()) {
            Question q = byId.get(id);
            if (q == null) continue;

            String correctText = correctText(q);
            String submitted = request.answers() != null ? request.answers().get(id) : null;
            boolean correct = submitted != null && submitted.equals(correctText);
            if (correct) score++;

            int switches = switchCounts.getOrDefault(id, 0);
            boolean flagged = flaggedIds.contains(id);
            int seconds = questionTime.getOrDefault(id, 0);

            var confidence = confidenceService.calculate(
                    switches, flagged, seconds, q.getQuestionType(), correct, submitted != null);

            String catName = q.getCategory().getName();
            int[] counts = catMap.computeIfAbsent(catName, k -> new int[]{0, 0});
            counts[1]++;
            if (correct) counts[0]++;

            Technique technique = q.getTechnique();
            String topicName = q.getTopic().getName();
            String techniqueName = technique != null ? technique.getName() : null;

            results.add(new TestResultResponse.QuestionResult(
                    q.getId(), q.getQuestion(),
                    List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()),
                    submitted, correctText, correct,
                    catName, topicName, techniqueName, q.getDifficulty(),
                    confidence.confidenceScore(), confidence.confidenceState()
            ));

            UserAttempt ua = new UserAttempt();
            ua.setUserId(userId);
            ua.setQuestionId(q.getId());
            ua.setTopicId(q.getTopic().getId());
            ua.setSelectionSequence(sequence++);
            ua.setFinalAnswer(submitted);
            ua.setIsCorrect(correct);
            ua.setSwitchCount(switches);
            ua.setIsFlagged(flagged);
            ua.setTimeTakenSeconds(seconds);
            ua.setConfidenceScore(confidence.confidenceScore());
            ua.setConfidenceState(confidence.confidenceState());
            userAttempts.add(ua);
        }

        Map<String, TestResultResponse.CategoryStats> breakdown = new LinkedHashMap<>();
        catMap.forEach((cat, c) -> breakdown.put(cat, new TestResultResponse.CategoryStats(c[0], c[1])));

        int total = results.size();
        double accuracy = total == 0 ? 0.0 : Math.round((score * 100.0 / total) * 10.0) / 10.0;

        if (total > 0) {
            TestAttempt attempt = new TestAttempt();
            attempt.setUserId(userId);
            attempt.setScore(score);
            attempt.setTotal(total);
            attempt.setAccuracy(accuracy);
            attempt.setTimeTakenSeconds(request.timeTaken());
            attempt.setType(request.type() != null && !request.type().isBlank() ? request.type() : "MOCK");
            // Dominant category = the one with the most questions in this attempt
            // (a test can mix categories, so this isn't necessarily the only one).
            catMap.entrySet().stream()
                    .max(Comparator.comparingInt(e -> e.getValue()[1]))
                    .ifPresent(e -> attempt.setCategory(e.getKey()));
            TestAttempt saved = testAttemptRepository.save(attempt);

            // Link children to the freshly-generated parent id, then persist them.
            userAttempts.forEach(ua -> ua.setTestAttemptId(saved.getId()));
            userAttemptRepository.saveAll(userAttempts);
        }

        return new TestResultResponse(score, total, request.timeTaken(), accuracy, results, breakdown);
    }

    private String correctText(Question q) {
        return switch (q.getCorrectAnswer()) {
            case "A" -> q.getOptionA();
            case "B" -> q.getOptionB();
            case "C" -> q.getOptionC();
            case "D" -> q.getOptionD();
            default -> "";
        };
    }

    private UUID authenticatedUserId() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
