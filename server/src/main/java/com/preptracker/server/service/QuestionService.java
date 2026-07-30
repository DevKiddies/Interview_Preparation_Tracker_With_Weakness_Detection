package com.preptracker.server.service;

// Fetches questions from the database based on topic and/or category name filters,
// shuffles them so every test session has a different order, applies a limit,
// and maps the results to QuestionDTO (which omits the correct answer so it's
// never exposed to the frontend during a live test).
//
// Questions store categoryId/topicId (FKs), while the public API still takes/returns
// category and topic as names, so this service resolves names <-> ids internally to
// keep the /api/questions contract unchanged for existing callers.

import com.preptracker.server.dto.QuestionDTO;
import com.preptracker.server.model.Category;
import com.preptracker.server.model.Question;
import com.preptracker.server.model.Topic;
import com.preptracker.server.repository.CategoryRepository;
import com.preptracker.server.repository.QuestionRepository;
import com.preptracker.server.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final CategoryRepository categoryRepository;
    private final TopicRepository topicRepository;

    public List<QuestionDTO> getQuestions(List<String> topics, List<String> categories, int limit) {
        List<Question> questions;
        if (categories != null && !categories.isEmpty()) {
            List<Long> categoryIds = categoryRepository.findByNameIn(categories).stream()
                    .map(Category::getId)
                    .toList();
            questions = categoryIds.size() == 1
                    ? questionRepository.findByCategoryId(categoryIds.get(0))
                    : questionRepository.findByCategoryIdIn(categoryIds);
        } else if (topics != null && !topics.isEmpty()) {
            List<Long> topicIds = topicRepository.findByNameIn(topics).stream()
                    .map(Topic::getId)
                    .toList();
            questions = topicIds.size() == 1
                    ? questionRepository.findByTopicId(topicIds.get(0))
                    : questionRepository.findByTopicIdIn(topicIds);
        } else {
            questions = questionRepository.findAll();
        }

        // Shuffle so each test session gets a different question order
        List<Question> shuffled = new ArrayList<>(questions);
        Collections.shuffle(shuffled);

        Map<Long, String> categoryNames = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));
        Map<Long, String> topicNames = topicRepository.findAll().stream()
                .collect(Collectors.toMap(Topic::getId, Topic::getName));

        return shuffled.stream()
                .limit(limit)
                .map(q -> toDTO(q, categoryNames, topicNames))
                .toList();
    }

    private QuestionDTO toDTO(Question q, Map<Long, String> categoryNames, Map<Long, String> topicNames) {
        return new QuestionDTO(
                q.getId(),
                q.getText(),
                List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()),
                categoryNames.get(q.getCategoryId()),
                q.getDifficulty(),
                topicNames.get(q.getTopicId())
        );
    }
}
