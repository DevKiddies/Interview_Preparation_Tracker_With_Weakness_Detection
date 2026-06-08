package com.preptracker.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlackListService {
    private final RedisTemplate<String, String> redisTemplate;

    public void blacklistToken(String token, long expirationMs){
        redisTemplate.opsForValue().set(
                "blacklist:"+token,
                "true",
                expirationMs,
                TimeUnit.MILLISECONDS
        );
    }

    public boolean isTokenBlacklisted(String token){
        return redisTemplate.hasKey("blacklist:" + token);
    }
}
