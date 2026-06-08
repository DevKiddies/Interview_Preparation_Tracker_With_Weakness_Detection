package com.preptracker.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory){
        RedisTemplate<String, String> template = new RedisTemplate<>(); //Spring tool used to talk to Redis
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer()); //This store data in plain readable string instead of binary
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
