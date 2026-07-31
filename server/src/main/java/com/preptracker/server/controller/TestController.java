package com.preptracker.server.controller;

// Handles mock test submission under /api/tests/submit.
// Receives the list of question IDs and the user's answers, fetches the correct
// answers from the DB, grades each question, and returns a detailed result
// including total score, per-question feedback, and a breakdown by category.

import com.preptracker.server.dto.TestResultResponse;
import com.preptracker.server.dto.TestSubmissionRequest;
import com.preptracker.server.model.Question;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TestAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final QuestionRepository questionRepository;
    private final TestAttemptRepository testAttemptRepository;

    @PostMapping("/submit")
    public ResponseEntity<TestResultResponse> submitTest(@RequestBody TestSubmissionRequest request) {
        List<Question> fetched = questionRepository.findAllById(request.questionIds());

        Map<Long, Question> byId = new HashMap<>();
        for (Question q : fetched) byId.put(q.getId(), q);

        int score = 0;
        List<TestResultResponse.QuestionResult> results = new ArrayList<>();
        Map<String, int[]> catMap = new LinkedHashMap<>();

        // Iterate in the original question order (not the DB fetch order) to build
        // the results list in the same sequence the user saw during the test.
        for (Long id : request.questionIds()) {
            Question q = byId.get(id);
            if (q == null) continue;

            String correctText = switch (q.getCorrectAnswer()) {
                case "A" -> q.getOptionA();
                case "B" -> q.getOptionB();
                case "C" -> q.getOptionC();
                case "D" -> q.getOptionD();
                default  -> "";
            };

            String submitted = request.answers().get(id);
            boolean correct  = submitted != null && submitted.equals(correctText);
            if (correct) score++;

            String catName = q.getCategory().getName();
            int[] counts = catMap.computeIfAbsent(catName, k -> new int[]{0, 0});
            counts[1]++;
            if (correct) counts[0]++;

            results.add(new TestResultResponse.QuestionResult(
                    q.getId(), q.getQuestion(),
                    List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()),
                    submitted, correctText, correct,
                    catName, q.getDifficulty()
            ));
        }

        Map<String, TestResultResponse.CategoryStats> breakdown = new LinkedHashMap<>();
        catMap.forEach((cat, c) -> breakdown.put(cat, new TestResultResponse.CategoryStats(c[0], c[1])));

        int total = results.size();
        double accuracy = total == 0 ? 0.0 : Math.round((score * 100.0 / total) * 10.0) / 10.0;

        if (total > 0) {
            TestAttempt attempt = new TestAttempt();
            attempt.setUserId(authenticatedUserId());
            attempt.setScore(score);
            attempt.setTotal(total);
            attempt.setAccuracy(accuracy);
            attempt.setTimeTakenSeconds(request.timeTaken());
            // Dominant category = the one with the most questions in this attempt
            // (a test can mix categories, so this isn't necessarily the only one).
            catMap.entrySet().stream()
                    .max(Comparator.comparingInt(e -> e.getValue()[1]))
                    .ifPresent(e -> attempt.setCategory(e.getKey()));
            testAttemptRepository.save(attempt);
        }

        return ResponseEntity.ok(new TestResultResponse(score, total, request.timeTaken(), accuracy, results, breakdown));
    }

    private UUID authenticatedUserId() {
        String principal = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }
}
