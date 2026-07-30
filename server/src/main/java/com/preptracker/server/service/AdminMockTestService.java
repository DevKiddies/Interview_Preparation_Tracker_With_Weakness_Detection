package com.preptracker.server.service;

// Business logic behind the admin Test Management pages: listing every mock
// test template (with its topic tags), creating, editing, and deleting.

import com.preptracker.server.dto.AdminMockTestDTO;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.model.MockTest;
import com.preptracker.server.model.TestTopic;
import com.preptracker.server.repository.MockTestRepository;
import com.preptracker.server.repository.TestTopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminMockTestService {

    // No test_attempts row can be traced back to a specific template yet (see
    // MockTest's class comment) — surface honest zeros instead of fabricating stats.
    private static final int PLACEHOLDER_ATTEMPT_COUNT = 0;
    private static final double PLACEHOLDER_AVG_SCORE = 0.0;

    private final MockTestRepository mockTestRepository;
    private final TestTopicRepository testTopicRepository;

    public List<AdminMockTestDTO> getAllTests() {
        List<MockTest> tests = mockTestRepository.findAll();

        Map<Long, List<Long>> topicIdsByTestId = testTopicRepository.findAll().stream()
                .collect(Collectors.groupingBy(TestTopic::getTestId,
                        Collectors.mapping(TestTopic::getTopicId, Collectors.toList())));

        return tests.stream()
                .map(t -> toDTO(t, topicIdsByTestId.getOrDefault(t.getId(), List.of())))
                .toList();
    }

    @Transactional
    public AdminMockTestDTO createTest(AdminMockTestDTO request) {
        MockTest saved = mockTestRepository.save(fromDTO(new MockTest(), request));
        saveTopicLinks(saved.getId(), request.topicIds());
        return toDTO(saved, request.topicIds() != null ? request.topicIds() : List.of());
    }

    @Transactional
    public AdminMockTestDTO updateTest(Long id, AdminMockTestDTO request) {
        MockTest t = mockTestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Test not found"));

        MockTest saved = mockTestRepository.save(fromDTO(t, request));
        testTopicRepository.deleteByTestId(id);
        saveTopicLinks(id, request.topicIds());
        return toDTO(saved, request.topicIds() != null ? request.topicIds() : List.of());
    }

    @Transactional
    public void deleteTest(Long id) {
        if (!mockTestRepository.existsById(id)) {
            throw new NotFoundException("Test not found");
        }
        testTopicRepository.deleteByTestId(id);
        mockTestRepository.deleteById(id);
    }

    private void saveTopicLinks(Long testId, List<Long> topicIds) {
        if (topicIds == null || topicIds.isEmpty()) return;
        List<TestTopic> links = topicIds.stream().map(topicId -> new TestTopic(testId, topicId)).toList();
        testTopicRepository.saveAll(links);
    }

    private MockTest fromDTO(MockTest t, AdminMockTestDTO request) {
        t.setName(request.name());
        t.setDescription(request.description());
        t.setCategoryId(request.categoryId());
        t.setQuestionCount(request.questionCount());
        t.setTimeLimitMinutes(request.timeLimitMinutes());
        t.setDifficulty(request.difficulty());
        t.setDifficultyEasy(request.difficultyEasy() != null ? request.difficultyEasy() : 0);
        t.setDifficultyMedium(request.difficultyMedium() != null ? request.difficultyMedium() : 0);
        t.setDifficultyHard(request.difficultyHard() != null ? request.difficultyHard() : 0);
        t.setRandomize(request.randomize() != null ? request.randomize() : true);
        t.setStatus(request.status() != null ? request.status() : "Draft");
        return t;
    }

    private AdminMockTestDTO toDTO(MockTest t, List<Long> topicIds) {
        return new AdminMockTestDTO(
                t.getId(), t.getName(), t.getDescription(), t.getCategoryId(), topicIds,
                t.getQuestionCount(), t.getTimeLimitMinutes(), t.getDifficulty(),
                t.getDifficultyEasy(), t.getDifficultyMedium(), t.getDifficultyHard(),
                t.getRandomize(), t.getStatus(), t.getCreatedAt(),
                PLACEHOLDER_ATTEMPT_COUNT, PLACEHOLDER_AVG_SCORE
        );
    }
}
