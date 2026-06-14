package com.preptracker.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    /*This RedisTemplate is at start is autoconfigured by SpringBoot, but the problem is that it stored the data as binary(unreadable to humans) when under inspection
    * THIS FILE REDIS CONFIG EXIST TO OVERRIDE THIS EXACT BEHAVIOR TO READABLE FORMAT
    * */
    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory)// This line creates a new Redis Template instance
    /*This REDISCONNECTIONFACTORY is the object that manages connection, SpringBoot creates it automatically by reading "application.yaml"
    * */
    {
        RedisTemplate<String, String> template = new RedisTemplate<>(); //Spring tool used to talk to Redis
        template.setConnectionFactory(connectionFactory);// Due to this syntax TEMPLATE knows where Redis is and how to connect to it. THIS IS A BRIDGE TO TEMPLATE AND REDIS
        template.setKeySerializer(new StringRedisSerializer()); //This line converts the Key to UTF8 String. When reading it back it again converts it into Java String
        template.setValueSerializer(new StringRedisSerializer()); //Same shit but for values
        return template; // Template is configured, Spring takes it and register it as Bean, this makes it injectable.
    }
}
