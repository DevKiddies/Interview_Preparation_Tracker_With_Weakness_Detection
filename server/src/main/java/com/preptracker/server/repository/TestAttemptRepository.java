package com.preptracker.server.repository;

import com.preptracker.server.model.TestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, Long> {
    List<TestAttempt> findByUserId(UUID userId);

    List<TestAttempt> findByUserIdOrderByTakenAtDesc(UUID userId);

    // Using Double instead of double to handle cases
    // where there might be no test attempts, which would result in a null value.
    @Query("SELECT AVG(t.accuracy) FROM TestAttempt t")
    Double getAverageAccuracy();

    // Using a projection interface to get the total correct answers
    // and total questions for calculating the question pass rate.
    public interface QuestionPassRateProjection {
        Long getTotalCorrect();

        Long getTotalQuestions();
    }
    // Using a native query to get the total correct answers and total questions
    // for calculating the question pass rate.
    @Query("""
                SELECT
                    SUM(t.score) AS totalCorrect,
                    SUM(t.total) AS totalQuestions
                FROM TestAttempt t
            """)
    QuestionPassRateProjection getQuestionPassRateData();
}