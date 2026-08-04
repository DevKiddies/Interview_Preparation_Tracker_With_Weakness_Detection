package com.preptracker.server.service;

// Business logic behind the admin "User Results" page: every persisted test
// attempt across every user, joined with basic user info.

import com.preptracker.server.dto.AdminTestResultDTO;
import com.preptracker.server.model.TestAttempt;
import com.preptracker.server.model.User;
import com.preptracker.server.repository.TestAttemptRepository;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTestResultService {

    // A test attempt below this accuracy is considered a fail.
    private static final int PASS_THRESHOLD = 50;

    private final TestAttemptRepository testAttemptRepository;
    private final UserRepository userRepository;

    public List<AdminTestResultDTO> getAllResults() {
        Map<UUID, User> usersById = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return testAttemptRepository.findAll().stream()
                .map(a -> toDTO(a, usersById.get(a.getUserId())))
                .toList();
    }

    private AdminTestResultDTO toDTO(TestAttempt attempt, User user) {
        int scorePercent = (int) Math.round(attempt.getAccuracy());
        int timeTakenMinutes = attempt.getTimeTakenSeconds() == null
                ? 0
                : (int) Math.round(attempt.getTimeTakenSeconds() / 60.0);

        return new AdminTestResultDTO(
                attempt.getId(),
                attempt.getUserId(),
                user != null ? user.getUsername() : "Unknown user",
                user != null ? user.getEmail() : "",
                attempt.getCategory(),
                scorePercent,
                attempt.getScore(),
                attempt.getTotal(),
                timeTakenMinutes,
                attempt.getTakenAt(),
                scorePercent >= PASS_THRESHOLD ? "pass" : "fail",
                attempt.getCompletionStatus() != null ? attempt.getCompletionStatus() : "COMPLETE"
        );
    }
}
