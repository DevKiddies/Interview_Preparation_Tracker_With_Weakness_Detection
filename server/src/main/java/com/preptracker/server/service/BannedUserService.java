package com.preptracker.server.service;

// Redis-backed cache of currently-banned user IDs, checked by JwtFilter on every
// request. Mirrors TokenBlackListService's approach: Postgres (User.isBanned)
// stays the source of truth for admin screens and login-time checks, but a banned
// user's *existing* session tokens are still cryptographically valid JWTs, so
// without this cache they'd keep working until they expire. This cache is what
// makes a ban take effect immediately on a user's very next request, not just on
// their next login.

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class BannedUserService {

    private final RedisTemplate<String, String> redisTemplate;

    // Redis requires a concrete TTL — "permanent" bans just get a very long one
    // rather than no expiry at all.
    private static final Duration PERMANENT_BAN_TTL = Duration.ofDays(3650);

    private String key(UUID userId) {
        return "banned:" + userId;
    }

    public void ban(UUID userId, LocalDateTime expiresAt) {
        Duration ttl = expiresAt == null ? PERMANENT_BAN_TTL : Duration.between(LocalDateTime.now(), expiresAt);
        if (ttl.isNegative() || ttl.isZero()) return;
        redisTemplate.opsForValue().set(key(userId), "true", ttl.toMillis(), TimeUnit.MILLISECONDS);
    }

    public void unban(UUID userId) {
        redisTemplate.delete(key(userId));
    }

    public boolean isBanned(UUID userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key(userId)));
    }
}
