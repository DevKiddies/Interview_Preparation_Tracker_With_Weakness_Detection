package com.preptracker.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlackListService {
    //This is configured spring tool, injected in this class
    private final RedisTemplate<String, String> redisTemplate; // This line is giving RedisTemplate instance that is already built in RedisConfig.jsx, it is injected automatically because of @RequiredArgsConstructor


    public void blacklistToken(String token, long expirationMs)
    /*This is taking 2 params: token and expirationMs which is the time that says for "how long the token will be blacklisted?"
    * This token is the same token extracted from Authorization Header after stripping "Bearer "
    * There is no point to keep blacklist entry after the token has already expired*/
    {
        /*Inside this method is defined how are we gonna access Redis's Data Structure, which is a key and value pair
        * Redis supports multiple DS but opsForValue() specifically gives operation on simple key-value pairs.
        * */
        redisTemplate.opsForValue().set(
                "blacklist:"+token, //the key is stored in redis with prefixed "blacklist:"
                "true", //value stored against the key
                expirationMs, // how long before redis auto-deletes
                TimeUnit.MILLISECONDS //the unit of the expiry time.
        );
    }

    //This member function take one parameter which is token and it checks if the token is blacklisted or not! This is used multiple time in JwtFilter
    public boolean isTokenBlacklisted(String token){
        return redisTemplate.hasKey("blacklist:" + token);
    }
}
