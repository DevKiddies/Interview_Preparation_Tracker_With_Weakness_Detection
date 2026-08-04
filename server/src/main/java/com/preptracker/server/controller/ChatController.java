package com.preptracker.server.controller;

import com.preptracker.server.dto.ChatRequest;
import com.preptracker.server.dto.ChatResponse;
import com.preptracker.server.service.AiCoachService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AiCoachService aiCoachService;

    public ChatController(AiCoachService aiCoachService) {
    this.aiCoachService = aiCoachService;
}

    @PostMapping
    public ChatResponse chat(@RequestBody ChatRequest request) {

        String answer = aiCoachService.generateFeedback(request.getMessage());

        return new ChatResponse(answer);
    }
}