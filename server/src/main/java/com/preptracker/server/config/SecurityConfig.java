package com.preptracker.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // register, login — public
                .requestMatchers("/api/users/**").permitAll() // TEMPORARY: remove once JWT filter is added
                .anyRequest().authenticated()
                );
        return http.build();
    }
}

// Important: The .permitAll() on /api/users/** is temporary for testing. Once your team implements JWT token 
// parsing (a JwtAuthFilter), change it to .authenticated() so users can only modify their own data with a valid token.
