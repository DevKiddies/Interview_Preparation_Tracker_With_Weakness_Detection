package com.preptracker.server.service;

// Manages a Redis-backed blacklist of JWTs that have been explicitly logged out.
// Since JWTs are stateless, we can't truly "invalidate" them — instead we store
// the token in Redis with a TTL matching its expiry time, then reject any request
// carrying a blacklisted token in JwtFilter. Redis automatically removes the entry
// once the token would have expired anyway, so the blacklist doesn't grow forever.

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlackListService {

    private final RedisTemplate<String, String> redisTemplate;

    // Adds a JWT to Redis so it gets rejected on all future requests even if the
    // signature is still valid. TTL matches the token's remaining lifetime so Redis
    // cleans up the entry automatically once the token would have expired anyway.
    public void blacklistToken(String token, long expirationMs) {
        redisTemplate.opsForValue().set(
                "blacklist:" + token,
                "true",
                expirationMs,
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isTokenBlacklisted(String token) {
        return redisTemplate.hasKey("blacklist:" + token);
    }
}
