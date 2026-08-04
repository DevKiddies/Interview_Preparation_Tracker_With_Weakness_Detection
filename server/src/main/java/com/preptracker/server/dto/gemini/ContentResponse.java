package com.preptracker.server.dto.gemini;

import java.util.List;

public class ContentResponse {

    private List<Part> parts;

    public ContentResponse() {
    }

    public ContentResponse(List<Part> parts) {
        this.parts = parts;
    }

    public List<Part> getParts() {
        return parts;
    }

    public void setParts(List<Part> parts) {
        this.parts = parts;
    }
}