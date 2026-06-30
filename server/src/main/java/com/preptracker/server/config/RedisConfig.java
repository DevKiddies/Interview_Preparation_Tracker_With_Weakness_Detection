package com.preptracker.server.config;

// Configures Redis to store keys and values as plain UTF-8 strings instead of
// Java's binary serialization (which is Spring Boot's default). This matters
// because we use Redis for the JWT blacklist — string storage lets you inspect
// blacklisted tokens directly in redis-cli during debugging.

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    // Spring Boot's default RedisTemplate serializes data using Java's binary serialization,
    // which makes keys like "blacklist:<token>" show up as unreadable bytes in redis-cli.
    // We override it here so both keys and values are stored as plain UTF-8 strings.
    @Bean
    RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
