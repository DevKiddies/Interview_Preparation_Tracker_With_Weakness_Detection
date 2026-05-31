package com.preptracker.server.service;

import com.preptracker.server.dto.AuthResponse;
import com.preptracker.server.dto.RegisterRequest;
import com.preptracker.server.model.User;
import com.preptracker.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request){

        if(!request.getPassword().equals(request.getConfirmPassword())){
            throw new RuntimeException("Password Do Not Match!");
        }

        if(userRepository.existsByEmail(request.getEmail())){
            throw new RuntimeException("Email Already Exists!");
        }

        if(userRepository.existsByUsername(request.getUsername())){
            throw new RuntimeException("Username Already Taken!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsVerified(false);
        user.setRole("USER");
        userRepository.save(user);

        String token = "jwt-placeholder";
        return new AuthResponse(token);
    }
}
