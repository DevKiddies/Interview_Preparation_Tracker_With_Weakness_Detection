package com.preptracker.server.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.preptracker.server.dto.gemini.Content;
import com.preptracker.server.dto.gemini.GeminiRequest;
import com.preptracker.server.dto.gemini.GeminiResponse;
import com.preptracker.server.dto.gemini.Part;

import java.util.List;

@Service
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(WebClient webClient) {
        this.webClient = webClient;
    }
    public String generateResponse(String prompt) {

    // Create the innermost object
    Part part = new Part(prompt);

    // Wrap Part inside Content
    Content content = new Content(List.of(part));

    // Wrap Content inside GeminiRequest
    GeminiRequest request = new GeminiRequest(List.of(content));

    // Send request to Gemini API
GeminiResponse response = webClient.post()
        .uri(apiUrl)
        .header("x-goog-api-key", apiKey)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(GeminiResponse.class)
        .block();

    // Return Gemini's generated text
    return response.getCandidates()
            .get(0)
            .getContent()
            .getParts()
            .get(0)
            .getText();
}
}