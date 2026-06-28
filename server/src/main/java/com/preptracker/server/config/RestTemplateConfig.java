package com.preptracker.server.config;

// Registers RestTemplate as a Spring bean so it can be injected anywhere we need
// to call external HTTP APIs - currently used for Google OAuth (userinfo endpoint)
// and GitHub OAuth (token exchange + user profile fetch).

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
