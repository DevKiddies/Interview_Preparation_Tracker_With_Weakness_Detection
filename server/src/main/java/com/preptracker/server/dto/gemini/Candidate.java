package com.preptracker.server.dto.gemini;

public class Candidate {

    private ContentResponse content;

    public Candidate() {
    }

    public Candidate(ContentResponse content) {
        this.content = content;
    }

    public ContentResponse getContent() {
        return content;
    }

    public void setContent(ContentResponse content) {
        this.content = content;
    }
}