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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final UserSessionService userSessionService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final TokenBlackListService tokenBlackListService;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${github.client-id}")
    private String githubClientId;

    @Value("${github.client-secret}")
    private String githubClientSecret;

    /**
     * A user can sign up with LOCAL credentials and later log in via Google or
     * GitHub.
     * We store all linked providers as a comma-separated string (e.g.
     * "LOCAL,GOOGLE")
     * so we can detect and handle account-linking without a separate join table.
     */
    // Returns true when the user has uploaded their own photo (stored as a base64
    // data URI).
    // In that case OAuth logins should not overwrite it with the platform avatar.
    private boolean hasCustomAvatar(User user) {
        String url = user.getAvatarUrl();
        return url != null && url.startsWith("data:");
    }

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
        enforceNotBanned(user);
        user.setLastActiveAt(LocalDateTime.now());
        userRepository.save(user);

        /* NEW LINE ADDED(no code replaced) */
        // Start a new login session to save it in user_sessions table.
        // This is used to calculate average session duration for admin dashboard.
        userSessionService.startSession(user.getId());

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token);
    }

    // Blocks login for banned users. A temporary ban past its expiry is treated as
    // lifted automatically (self-healing) rather than requiring an admin to unban
    // it.
    private void enforceNotBanned(User user) {
        if (!Boolean.TRUE.equals(user.getIsBanned()))
            return;

        boolean expired = user.getBanExpiresAt() != null && user.getBanExpiresAt().isBefore(LocalDateTime.now());
        if (expired) {
            user.setIsBanned(false);
            user.setBanExpiresAt(null);
            userRepository.save(user);
            return;
        }

        throw new UnauthorizedException("Your account has been banned" +
                (user.getBanReason() != null ? ": " + user.getBanReason() : "") +
                ". Please contact administration.");
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
        /* OLD CODE */
        // verificationToken.setUsed(true);
        // user.setIsVerified(true);
        // String token = jwtUtil.generateToken(user);
        // verificationTokenRepository.save(verificationToken);
        // userRepository.save(user);
        // //Save the login session for the user after successful OTP verification and
        // login.
        // // This enters a new record in the user_sessions table with loginTime set to
        // now and logoutTime as null.
        // userSessionService.startSession(user.getId());
        // return new AuthResponse(token);

        // Mark the OTP as used and activate the account.
        // Since OTP verification also logs the user in, update lastActiveAt before
        // creating a new login session.
        verificationToken.setUsed(true);

        user.setIsVerified(true);
        user.setLastActiveAt(LocalDateTime.now());

        verificationTokenRepository.save(verificationToken);
        userRepository.save(user);

        // Save the login session for the user after successful OTP verification.
        userSessionService.startSession(user.getId());

        String token = jwtUtil.generateToken(user);

        notificationService.create(user.getId(), "WELCOME", "Welcome to PrepEdge!",
                "Your account is verified. Start with a mock test or explore the coding problems to build your prep streak.",
                "/practice/mock-tests");

        return new AuthResponse(token);
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("No account found with that email address"));

        if (user.getIsVerified()) {
            throw new RuntimeException("Account is already verified");
        }

        // Invalidate all previous OTPs before issuing a new one to prevent replay
        // attacks
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

        // Close the active session
        UUID userId = UUID.fromString(jwtUtil.extractUserId(token));
        userSessionService.endSession(userId);

        // Blacklist the token only for its REMAINING lifetime, not the full 24h.
        // Once the token would have expired anyway, the signature/expiry check
        // rejects it and the Redis entry (which would otherwise linger uselessly)
        // is allowed to expire at the same moment.
        long remainingMs = Math.max(0, jwtUtil.extractExpiration(token).getTime() - System.currentTimeMillis());
        tokenBlackListService.blacklistToken(token, remainingMs);
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

        notificationService.create(user.getId(), "SECURITY", "Password reset",
                "Your password was reset successfully. If this wasn't you, contact support immediately.", null);
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
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

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
                enforceNotBanned(user);
                // Only apply the platform avatar when the user hasn't uploaded a custom photo.
                // Custom uploads are stored as base64 data URIs; platform URLs are plain https.
                if (picture != null && !hasCustomAvatar(user))
                    user.setAvatarUrl(picture);

                // Update lastActiveAt to reflect that the user has logged in via Google.
                user.setLastActiveAt(LocalDateTime.now());

                userRepository.save(user);

                // Start a new login session for the user after successful Google login.
                userSessionService.startSession(user.getId());

                return new AuthResponse(jwtUtil.generateToken(user));
            }

            // Account-linking: same email already exists (e.g. registered with LOCAL) —
            // link Google to it
            Optional<User> existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent()) {
                User user = existingByEmail.get();
                enforceNotBanned(user);
                user.setGoogleId(googleId);
                user.setAuthProvider(appendProvider(user.getAuthProvider(), "GOOGLE"));
                if (picture != null && !hasCustomAvatar(user))
                    user.setAvatarUrl(picture);

                // Update lastActiveAt to reflect that the user has logged in via Google.
                user.setLastActiveAt(LocalDateTime.now());

                userRepository.save(user);

                // Start a new login session for the user after successful Google login.
                userSessionService.startSession(user.getId());

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

            // Update last active time for the newly created user.
            newUser.setLastActiveAt(LocalDateTime.now());

            userRepository.save(newUser);

            // Start a new login session for the user after successful Google login.
            userSessionService.startSession(newUser.getId());

            notificationService.create(newUser.getId(), "WELCOME", "Welcome to PrepEdge!",
                    "Your account is verified. Start with a mock test or explore the coding problems to build your prep streak.",
                    "/practice/mock-tests");

            return new AuthResponse(jwtUtil.generateToken(newUser));

        } catch (UnauthorizedException e) {
            throw e; // don't mask "account banned" behind a generic "Google login failed" message
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
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

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
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> userInfo = userResponse.getBody();
            String githubId = String.valueOf(userInfo.get("id"));
            String name = (String) userInfo.get("name");
            String login = (String) userInfo.get("login");
            String githubAvatar = (String) userInfo.get("avatar_url");

            String email = (String) userInfo.get("email");
            if (email == null) {
                // GitHub users with private email settings return null from /user.
                // We fall back to the /user/emails endpoint and pick their primary address.
                ResponseEntity<List<Map<String, Object>>> emailResponse = restTemplate.exchange(
                        "https://api.github.com/user/emails",
                        HttpMethod.GET, userEntity,
                        new ParameterizedTypeReference<List<Map<String, Object>>>() {
                        });
                List<Map<String, Object>> emails = emailResponse.getBody();
                email = emails.stream()
                        .filter(e -> Boolean.TRUE.equals(e.get("primary")))
                        .map(e -> (String) e.get("email"))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("No primary email found on GitHub account"));
            }

            Optional<User> existingByGithubId = userRepository.findByGithubId(githubId);
            if (existingByGithubId.isPresent()) {
                User user = existingByGithubId.get();
                enforceNotBanned(user);
                if (githubAvatar != null && !hasCustomAvatar(user))
                    user.setAvatarUrl(githubAvatar);

                // Update lastActiveAt to reflect that the user has logged in via GitHub.
                user.setLastActiveAt(LocalDateTime.now());

                userRepository.save(user);

                // Start a new login session for the user after successful GitHub login.
                userSessionService.startSession(user.getId());

                return jwtUtil.generateToken(user);
            }

            Optional<User> existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent()) {
                User user = existingByEmail.get();
                enforceNotBanned(user);
                user.setGithubId(githubId);
                user.setAuthProvider(appendProvider(user.getAuthProvider(), "GITHUB"));
                if (githubAvatar != null && !hasCustomAvatar(user))
                    user.setAvatarUrl(githubAvatar);

                // Update lastActiveAt to reflect that the user has logged in via GitHub.
                user.setLastActiveAt(LocalDateTime.now());

                userRepository.save(user);
                
                // Start a new login session for the user after successful GitHub login.
                userSessionService.startSession(user.getId());
                
                return jwtUtil.generateToken(user);
            }

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(generateUniqueUsername(login != null ? login : name));
            newUser.setPassword(null);
            newUser.setGithubId(githubId);
            newUser.setAuthProvider("GITHUB");
            newUser.setIsVerified(true);
            newUser.setAvatarUrl(githubAvatar);
            
            // Update last active time for the newly created user.
            newUser.setLastActiveAt(LocalDateTime.now());

            userRepository.save(newUser);

            // Start a new login session for the user after successful GitHub login.
            userSessionService.startSession(newUser.getId());

            notificationService.create(newUser.getId(), "WELCOME", "Welcome to PrepEdge!",
                    "Your account is verified. Start with a mock test or explore the coding problems to build your prep streak.",
                    "/practice/mock-tests");

            return jwtUtil.generateToken(newUser);

        } catch (UnauthorizedException e) {
            throw e; // don't mask "account banned" behind a generic "GitHub login failed" message
        } catch (Exception e) {
            throw new RuntimeException("GitHub login failed: " + e.getMessage());
        }
    }

    // Derives a username from the OAuth display name and appends a numeric suffix
    // if it's taken.
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
