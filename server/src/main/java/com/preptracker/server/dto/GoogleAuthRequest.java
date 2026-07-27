package com.preptracker.server.dto;

// Request body for POST /api/auth/google.
// The frontend completes the Google OAuth flow and sends us the access token,
// which we use to fetch the user's profile from Google's userinfo endpoint.

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String accessToken;
}