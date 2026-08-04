package com.preptracker.server.config;

// Defines the security rules for the entire application:
//   - Which endpoints are public (auth routes, admin login)
//   - Which require a valid JWT (all other routes)
//   - Which require ROLE_ADMIN in the token (admin management routes)
// Also configures CORS (only the frontend origin is allowed) and plugs in
// JwtFilter so it runs before Spring's own authentication filter.

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${github.frontend-url}")
    private String frontendUrl;

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF disabled — the app is stateless (JWT Bearer tokens, no cookies)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints are public (login, register, OTP, OAuth callbacks)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/admin/auth/**").permitAll()
                        // Contact Us form — public, no login required to reach out
                        .requestMatchers("/api/contact/**").permitAll()
                        // Landing page hero stats — public aggregate counts, no auth needed
                        .requestMatchers("/api/public/**").permitAll()
                        // AI Chatbot endpoint
                        .requestMatchers("/api/chat/**").authenticated()
                        // Admin panel routes require ROLE_ADMIN, which JwtFilter injects from the token's "role" claim
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
