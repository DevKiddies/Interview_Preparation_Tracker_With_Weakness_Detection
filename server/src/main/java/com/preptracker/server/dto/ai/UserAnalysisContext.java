package com.preptracker.server.dto.ai;

import java.util.List;

public class UserAnalysisContext {

    private String username;

    private String targetRole;

    private int totalTests;

    private double averageScore;

    private double averageConfidence;

    private List<String> strongTopics;

    private List<String> weakTopics;

    private String currentQuestion;

    public UserAnalysisContext() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public int getTotalTests() {
        return totalTests;
    }

    public void setTotalTests(int totalTests) {
        this.totalTests = totalTests;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

    public double getAverageConfidence() {
        return averageConfidence;
    }

    public void setAverageConfidence(double averageConfidence) {
        this.averageConfidence = averageConfidence;
    }

    public List<String> getStrongTopics() {
        return strongTopics;
    }

    public void setStrongTopics(List<String> strongTopics) {
        this.strongTopics = strongTopics;
    }

    public List<String> getWeakTopics() {
        return weakTopics;
    }

    public void setWeakTopics(List<String> weakTopics) {
        this.weakTopics = weakTopics;
    }

    public String getCurrentQuestion() {
        return currentQuestion;
    }

    public void setCurrentQuestion(String currentQuestion) {
        this.currentQuestion = currentQuestion;
    }
}