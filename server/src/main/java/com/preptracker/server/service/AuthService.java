package com.preptracker.server.service;

// Core authentication logic for the application.
// Handles: user registration with email OTP verification, login (email or username),
// OTP resend, logout (via JWT blacklist), password reset flow, and OAuth login
// via Google and GitHub. Also handles account-linking — if a user registered with
// email and later logs in with Google using the same address, both are merged
// into one account rather than creating a duplicate.

import com.preptracker.server.dto.AuthResponse;
import com.preptracker.server.dto.ForgotPasswordRequest;
import com.preptracker.server.dto.LoginRequest;
import com.preptracker.server.dto.RegisterRequest;
import com.preptracker.server.dto.ResetPasswordRequest;
import com.preptracker.server.dto.VerifyOtpRequest;
import com.preptracker.server.exception.ConflictException;
import com.preptracker.server.exception.NotFoundException;
import com.preptracker.server.exception.UnauthorizedException;
import com.preptracker.server.model.User;
import com.preptracker.server.model.VerificationToken;
import com.preptracker.server.repository.UserRepository;
import com.preptracker.server.repository.VerificationTokenRepository;
import com.preptracker.server.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final TokenBlackListService tokenBlackListService;
    private final RestTemplate restTemplate;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${github.client-id}")
    private String githubClientId;

    @Value("${github.client-secret}")
    private String githubClientSecret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    /**
     * A user can sign up with LOCAL credentials and later log in via Google or GitHub.
     * We store all linked providers as a comma-separated string (e.g. "LOCAL,GOOGLE")
     * so we can detect and handle account-linking without a separate join table.
     */
    private String appendProvider(String existing, String newProvider) {
        if (existing == null || existing.isBlank()) {
            return newProvider;
        }
        List<String> providers = new ArrayList<>(Arrays.asList(existing.split(",")));
        if (!providers.contains(newProvider)) {
            providers.add(newProvider);
        }
        return String.join(",", providers);
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username is already taken");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsVerified(false);
        user.setAuthProvider("LOCAL");
        userRepository.save(user);

        String otp = String.valueOf(100000 + SECURE_RANDOM.nextInt(900000));
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUserId(user.getId());
        verificationToken.setOtp(otp);
        verificationToken.setExpiresAt(LocalDateTime.now().plusMinutes(20));
        verificationToken.setUsed(false);
        verificationTokenRepository.save(verificationToken);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public AuthResponse login(LoginRequest request) {
        User user;
        if (request.getIdentifier().contains("@")) {
            user = userRepository.findByEmail(request.getIdentifier())
                    .orElseThrow(() -> new NotFoundException("No account found with that email"));
        } else {
            user = userRepository.findByUsername(request.getIdentifier())
                    .orElseThrow(() -> new NotFoundException("No account found with that username"));
        }
        if (!user.getIsVerified()) {
            throw new UnauthorizedException("Email not verified. Please check your inbox.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid password");
        }
        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token);
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("No account found with that email address"));

        VerificationToken verificationToken = verificationTokenRepository
                .findByUserIdAndOtp(user.getId(), request.getOtp())
                .orElseThrow(() -> new UnauthorizedException("Invalid OTP"));

        if (verificationToken.getUsed())
            throw new UnauthorizedException("OTP already used");
        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new UnauthorizedException("OTP expired");

        verificationToken.setUsed(true);
        user.setIsVerified(true);
        String token = jwtUtil.generateToken(user);
        verificationTokenRepository.save(verificationToken);
        userRepository.save(user);
        return new AuthResponse(token);
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("No account found with that email address"));

        if (user.getIsVerified()) {
            throw new RuntimeException("Account is already verified");
        }

        // Invalidate all previous OTPs before issuing a new one to prevent replay attacks
        List<VerificationToken> existing = verificationTokenRepository.findAllByUserId(user.getId());
        existing.forEach(t -> t.setUsed(true));
        verificationTokenRepository.saveAll(existing);

        String otp = String.valueOf(100000 + SECURE_RANDOM.nextInt(900000));
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUserId(user.getId());
        verificationToken.setOtp(otp);
        verificationToken.setExpiresAt(LocalDateTime.now().plusMinutes(20));
        verificationToken.setUsed(false);
        verificationTokenRepository.save(verificationToken);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public AuthResponse logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid Authorization Header");
        }
        String token = authHeader.substring(7);
        tokenBlackListService.blacklistToken(token, expirationMs);
        return new AuthResponse("Logged Out Successfully");
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("No account found with that email address"));

        // Invalidate all existing tokens for this user
        List<VerificationToken> existing = verificationTokenRepository.findAllByUserId(user.getId());
        existing.forEach(token -> token.setUsed(true));
        verificationTokenRepository.saveAll(existing);

        String otp = String.valueOf(100000 + SECURE_RANDOM.nextInt(900000));
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setUserId(user.getId());
        verificationToken.setOtp(otp);
        verificationToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        verificationToken.setUsed(false);
        verificationTokenRepository.save(verificationToken);

        emailService.sendPasswordResetEmail(user.getEmail(), otp);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("No account found with that email address"));

        VerificationToken token = verificationTokenRepository
                .findByUserIdAndOtp(user.getId(), request.getOtp())
                .orElseThrow(() -> new UnauthorizedException("Invalid OTP"));

        if (token.getUsed())
            throw new UnauthorizedException("OTP has already been used");
        if (token.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new UnauthorizedException("OTP has expired");

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        verificationTokenRepository.save(token);
    }

    public AuthResponse loginWithGoogle(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> googleResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            Map<String, Object> userInfo = googleResponse.getBody();
            if (userInfo == null) {
                throw new RuntimeException("Failed to fetch user info from Google");
            }

            String googleId = (String) userInfo.get("sub");
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");

            if (googleId == null || email == null) {
                throw new RuntimeException("Invalid user info from Google");
            }

            // Fast path: user already linked this Google account
            Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
            if (existingByGoogleId.isPresent()) {
                User user = existingByGoogleId.get();
                if (picture != null) user.setAvatarUrl(picture);
                userRepository.save(user);
                return new AuthResponse(jwtUtil.generateToken(user));
            }

            // Account-linking: same email already exists (e.g. registered with LOCAL) — link Google to it
            Optional<User> existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent()) {
                User user = existingByEmail.get();
                user.setGoogleId(googleId);
                user.setAuthProvider(appendProvider(user.getAuthProvider(), "GOOGLE"));
                if (picture != null) user.setAvatarUrl(picture);
                userRepository.save(user);
                return new AuthResponse(jwtUtil.generateToken(user));
            }

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(generateUniqueUsername(name));
            newUser.setPassword(null);
            newUser.setGoogleId(googleId);
            newUser.setAuthProvider("GOOGLE");
            newUser.setIsVerified(true);
            newUser.setAvatarUrl(picture);
            userRepository.save(newUser);

            return new AuthResponse(jwtUtil.generateToken(newUser));

        } catch (Exception e) {
            throw new RuntimeException("Google login failed: " + e.getMessage());
        }
    }

    public String loginWithGithub(String code) {
        try {
            String tokenUrl = "https://github.com/login/oauth/access_token"
                    + "?client_id=" + githubClientId
                    + "&client_secret=" + githubClientSecret
                    + "&code=" + code;

            HttpHeaders tokenHeaders = new HttpHeaders();
            tokenHeaders.set("Accept", "application/json");
            HttpEntity<String> tokenEntity = new HttpEntity<>(tokenHeaders);

            ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, tokenEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            String accessToken = (String) tokenResponse.getBody().get("access_token");
            if (accessToken == null) {
                throw new RuntimeException("Failed to get access token from GitHub");
            }

            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);
            HttpEntity<String> userEntity = new HttpEntity<>(userHeaders);

            ResponseEntity<Map<String, Object>> userResponse = restTemplate.exchange(
                    "https://api.github.com/user",
                    HttpMethod.GET, userEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            Map<String, Object> userInfo = userResponse.getBody();
            String githubId = String.valueOf(userInfo.get("id"));
            String name = (String) userInfo.get("name");
            String login = (String) userInfo.get("login");

            String email = (String) userInfo.get("email");
            if (email == null) {
                // GitHub users with private email settings return null from /user.
                // We fall back to the /user/emails endpoint and pick their primary address.
                ResponseEntity<List<Map<String, Object>>> emailResponse = restTemplate.exchange(
                        "https://api.github.com/user/emails",
                        HttpMethod.GET, userEntity,
                        new ParameterizedTypeReference<List<Map<String, Object>>>() {});
                List<Map<String, Object>> emails = emailResponse.getBody();
                email = emails.stream()
                        .filter(e -> Boolean.TRUE.equals(e.get("primary")))
                        .map(e -> (String) e.get("email"))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("No primary email found on GitHub account"));
            }

            Optional<User> existingByGithubId = userRepository.findByGithubId(githubId);
            if (existingByGithubId.isPresent()) {
                return jwtUtil.generateToken(existingByGithubId.get());
            }

            Optional<User> existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent()) {
                User user = existingByEmail.get();
                user.setGithubId(githubId);
                user.setAuthProvider(appendProvider(user.getAuthProvider(), "GITHUB"));
                userRepository.save(user);
                return jwtUtil.generateToken(user);
            }

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(generateUniqueUsername(login != null ? login : name));
            newUser.setPassword(null);
            newUser.setGithubId(githubId);
            newUser.setAuthProvider("GITHUB");
            newUser.setIsVerified(true);
            userRepository.save(newUser);

            return jwtUtil.generateToken(newUser);

        } catch (Exception e) {
            throw new RuntimeException("GitHub login failed: " + e.getMessage());
        }
    }

    // Derives a username from the OAuth display name and appends a numeric suffix if it's taken.
    private String generateUniqueUsername(String name) {
        String base = name != null ? name.toLowerCase().replaceAll("\\s+", "") : "user";
        String username = base;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + counter++;
        }
        return username;
    }
}
