package com.preptracker.server.service;

// Business logic behind the admin Question Bank page: listing every question
// with its full shape (including the correct answer), creating (single/bulk),
// editing, and deleting.

import com.preptracker.server.dto.AdminQuestionDTO;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.model.Question;
import com.preptracker.server.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminQuestionService {

    // The live `questions` table has question_type as NOT NULL, but the admin
    // form treats it as optional — fall back to this rather than forcing admins
    // to fill it in for every question.
    private static final String DEFAULT_QUESTION_TYPE = "General";

    private final QuestionRepository questionRepository;

    public List<AdminQuestionDTO> getAllQuestions() {
        return questionRepository.findAll().stream().map(this::toDTO).toList();
    }

    public AdminQuestionDTO createQuestion(AdminQuestionDTO request) {
        return toDTO(questionRepository.save(fromDTO(new Question(), request)));
    }

    public List<AdminQuestionDTO> createQuestions(List<AdminQuestionDTO> requests) {
        List<Question> toSave = requests.stream().map(r -> fromDTO(new Question(), r)).toList();
        return questionRepository.saveAll(toSave).stream().map(this::toDTO).toList();
    }

    public AdminQuestionDTO updateQuestion(Long id, AdminQuestionDTO request) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question not found"));

        return toDTO(questionRepository.save(fromDTO(q, request)));
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new NotFoundException("Question not found");
        }
        questionRepository.deleteById(id);
    }

    private Question fromDTO(Question q, AdminQuestionDTO request) {
        q.setText(request.question());
        q.setOptionA(request.optionA());
        q.setOptionB(request.optionB());
        q.setOptionC(request.optionC());
        q.setOptionD(request.optionD());
        q.setCorrectAnswer(request.correctAnswer());
        q.setCategoryId(request.categoryId());
        q.setTopicId(request.topicId());
        q.setDifficulty(request.difficulty());
        q.setQuestionType(request.questionType() != null && !request.questionType().isBlank()
                ? request.questionType()
                : DEFAULT_QUESTION_TYPE);
        q.setTechniqueId(request.techniqueId());
        q.setCompanyId(request.companyId());
        return q;
    }

    private AdminQuestionDTO toDTO(Question q) {
        return new AdminQuestionDTO(
                q.getId(), q.getText(),
                q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(),
                q.getCorrectAnswer(), q.getCategoryId(), q.getTopicId(),
                q.getDifficulty(), q.getQuestionType(), q.getTechniqueId(), q.getCompanyId()
        );
    }
}
