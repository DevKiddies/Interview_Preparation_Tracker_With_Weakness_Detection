package com.preptracker.server.service;

import com.preptracker.server.dto.QuestionDTO;
import com.preptracker.server.model.Question;
import com.preptracker.server.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public List<QuestionDTO> getQuestions(List<String> topics, List<String> categories, int limit) {
        List<Question> questions;

        if (categories != null && !categories.isEmpty()) {
            questions = categories.size() == 1
                    ? questionRepository.findByCategoryName(categories.get(0))
                    : questionRepository.findByCategoryNameIn(categories);
        } else if (topics != null && !topics.isEmpty()) {
            // "DSA" is shorthand for the "Data Structures & Algorithms" category
            if (topics.size() == 1 && "DSA".equals(topics.get(0))) {
                questions = questionRepository.findByCategoryName("Data Structures & Algorithms");
            } else {
                questions = topics.size() == 1
                        ? questionRepository.findByTopicName(topics.get(0))
                        : questionRepository.findByTopicNameIn(topics);
            }
        } else {
            // FIX: The default behavior now pulls exclusively from "Data Structures & Algorithms"
            // This avoids findAll() and inherently fixes the LazyInitializationException.
            questions = questionRepository.findByCategoryName("Data Structures & Algorithms");
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
                q.getQuestion(),
                List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()),
                q.getCategory().getName(),
                q.getDifficulty(),
                q.getTopic().getName()
        );
    }
}