package com.preptracker.server.service;

import com.preptracker.server.dto.AuthResponse;
import com.preptracker.server.dto.LoginRequest;
import com.preptracker.server.dto.RegisterRequest;
import com.preptracker.server.dto.VerifyOtpRequest;
import com.preptracker.server.model.User;
import com.preptracker.server.model.VerificationToken;
import com.preptracker.server.repository.UserRepository;
import com.preptracker.server.repository.VerificationTokenRepository;
import com.preptracker.server.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final TokenBlackListService tokenBlackListService;

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

        String otp = String.valueOf((int)(Math.random()*900000)+100000);

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUserId(user.getId());
        verificationToken.setOtp(otp);
        verificationToken.setExpiresAt(LocalDateTime.now().plusMinutes(20));
        verificationToken.setUsed(false);
        verificationTokenRepository.save(verificationToken);

        emailService.sendOtpEmail(user.getEmail(),otp);
        return new AuthResponse("Check Your Email For OTP Verification");
    }

    public AuthResponse login(LoginRequest request){
        User user = null;
        if(request.getIdentifier().contains("@")){
                user = userRepository.findByEmail(request.getIdentifier())
                        .orElseThrow(() -> new RuntimeException("Email doesn't exist"));
        }else{
            user = userRepository.findByUsername(request.getIdentifier())
                    .orElseThrow(()->new RuntimeException("Username Do Not Exist"));
        }
        if(!user.getIsVerified()){
            throw new RuntimeException("Email Not Verified!");
        }
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid Password");
        }
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request){
        VerificationToken verificationToken = null;
        verificationToken = verificationTokenRepository.findByOtp(request.getOtp())
                .orElseThrow(() -> new RuntimeException("OTP Not Valid"));
        if(verificationToken.getUsed())
            throw new RuntimeException("OTP already used");
        if(verificationToken.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP Expired");
        verificationToken.setUsed(true);
        UUID userId = verificationToken.getUserId();
        User user = userRepository.findById(userId).orElseThrow(()->new RuntimeException("User Not Found"));
        user.setIsVerified(true);
        String token = jwtUtil.generateToken(user);
        verificationTokenRepository.save(verificationToken);
        userRepository.save(user);
        return new AuthResponse(token);
    }

    @Value("${jwt.expiration}")
    private long expirationMs;

    public AuthResponse logout(String authHeader){
        if(authHeader==null || !authHeader.startsWith("Bearer ")){
            throw new RuntimeException("Invalid Authorization Header");
        }
        String token = authHeader.substring(7);
        tokenBlackListService.blacklistToken(token, expirationMs);
        return new AuthResponse("Logged Out Successfully");
    }
}
