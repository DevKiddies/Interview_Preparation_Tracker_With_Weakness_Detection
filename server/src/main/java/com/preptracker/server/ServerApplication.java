package com.preptracker.server;

// Entry point of the PrepTracker Spring Boot application.
// Starts the embedded Tomcat server and bootstraps the entire Spring application context.

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// We handle auth ourselves via JWT + JwtFilter, so Spring's built-in UserDetailsService
// is not needed. Excluding it avoids the auto-generated "user/password" printed at startup.
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class ServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}

}
