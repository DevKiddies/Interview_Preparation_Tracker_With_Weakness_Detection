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
    public PasswordEncoder passwordEncoder(){ // This is not class, this is method!, By using @Bean it makes the method injectable anywhere!, like in this case in AuthService.
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http.csrf(csrf -> csrf.disable()) //CSRF:Cross Site Request Forgery is disabled because we are using JWT for auth.
        .authorizeHttpRequests(auth-> auth.requestMatchers("/api/auth/**").permitAll() // if api/auth/<anything> is permitted
                .anyRequest() .authenticated()); //else check for token
        return http.build();
    }
}
