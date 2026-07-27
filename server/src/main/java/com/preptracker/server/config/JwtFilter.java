package com.preptracker.server.config;

// Runs once per request and handles JWT authentication.
// It reads the "Authorization: Bearer <token>" header, validates the token,
// checks it hasn't been blacklisted (logged out), and then sets the authenticated
// user into Spring Security's context so the rest of the request knows who's calling.
// Requests with no token or an invalid token are either rejected or passed through
// as unauthenticated (SecurityConfig decides whether the endpoint requires auth).

import com.preptracker.server.service.TokenBlackListService;
import com.preptracker.server.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlackListService tokenBlackListService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(7);

            // Blacklist check comes before signature verification so that logged-out tokens
            // are rejected immediately, even if they haven't reached their expiry time yet.
            if (tokenBlackListService.isTokenBlacklisted(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid or expired token");
                return;
            }

            String userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);

            // Regular users have no "role" claim; only admin tokens carry ROLE_ADMIN
            List<SimpleGrantedAuthority> authorities = (role != null)
                    ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    : List.of();

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            log.error("JWT authentication error: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication failed");
        }
    }
}
