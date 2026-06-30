package com.preptracker.server.service;

// Fetches questions from the database based on topic and/or category filters,
// shuffles them so every test session has a different order, applies a limit,
// and maps the results to QuestionDTO (which omits the correct answer so it's
// never exposed to the frontend during a live test).

import com.preptracker.server.dto.QuestionDTO;
import com.preptracker.server.model.Question;
import com.preptracker.server.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    public List<QuestionDTO> getQuestions(String topic, List<String> categories, int limit) {
        List<Question> questions;
        if (categories != null && !categories.isEmpty()) {
            questions = categories.size() == 1
                ? questionRepository.findByCategory(categories.get(0))
                : questionRepository.findByCategoryIn(categories);
        } else if (topic != null && !topic.isBlank()) {
            questions = questionRepository.findByTopic(topic);
        } else {
            questions = questionRepository.findAll();
        }

        // Shuffle so each test session gets a different question order
        List<Question> shuffled = new ArrayList<>(questions);
        Collections.shuffle(shuffled);

        return shuffled.stream()
                .limit(limit)
                .map(this::toDTO)
                .toList();
    }

    private QuestionDTO toDTO(Question q) {
        return new QuestionDTO(
                q.getId(),
                q.getText(),
                List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()),
                q.getCategory(),
                q.getDifficulty(),
                q.getTopic()
        );
    }
}
