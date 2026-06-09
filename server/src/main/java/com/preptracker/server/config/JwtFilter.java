package com.preptracker.server.config;

import com.preptracker.server.service.TokenBlackListService;
import com.preptracker.server.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/*This Filter Class exist to check intercept the incoming request. Without this GET /api/dashboard with valid or no token will be treated the same and allowed entry
* Due to Spring Basic Security Check, it doesnt know what Jwt is so this FILTER is created to bridge the JWT SYSTEM with SPRING SECURITY
* This runs on every single request, it reads and validates the tokens, checks the blacklist and tells Spring Security who the user is.*/


@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter // ONCEPERREQUESTFILTER is the class that intercept request, this allows the filter code to run exactly once per request
{
    private final JwtUtil jwtUtil;
    private final TokenBlackListService tokenBlackListService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain/*Chain of filter that request passes through*/) //This function will run every request
    {
        /* This HTTPSERVLETREQUEST is the object that represents everything about the incoming HTTP REQUEST.
        * THE URL, HEADER, BODY all of it is accessible through this object.
        *
        * This HTTPSERVLETRESPONSE is the object that represents HTTP response that will be sent back to the client. Use this object to write your own response directly bypassing controller entirely
        * */
        try {
            //READING HEADER
            /*
            * Every request passes through this filter like "/api/auth/register/" and  "/api/auth/login". Those request dont have token because user isn't logged in yet.
            * So if there is no Authorization in header, or it doesnt have "Bearer " prefix, you just let request pass through without doing anything.
            * Spring Security permitALl() rule on "/api/auth/**" will handle from there.
            * */
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                filterChain.doFilter(request, response);
                return;
            }
            // This cuts off the "Bearer " is exactly 7 character including the space,
            // substring(7) cuts off those first 7 characters and give your raw JWT token string
            String token = authHeader.substring(7);

            /*
            * Before validating the token's signature or expiry, we check Redis first,
            * if token already in blacklist meaning the user has already logged out
            * */
            if (tokenBlackListService.isTokenBlacklisted(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);// This is just constant defined for 401
                response.getWriter().write("Invalid or expired token");
                return;
            }
            // Once the validity of token is confirmed, the userId is extracted from it.
            String userId = jwtUtil.extractUserId(token);

            //This USERNAMEPASSWORDAUTHENTICATIONTOKEN is Spring Security standard object for representing an authenticated user.
            /*
            * Its constructor takes three things userId, credentials, authorities
            * The credential is null because its already authenticated via JWT, no password needed again.
            * The authorities part is just empty list for roles/permission.
            * */
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId, null, List.of());
            //SECURITYCONTEXTHOLDER is the localstorage for thread for current request, getContext().setAuth(auth) writes the authentication object onto that storage
            SecurityContextHolder.getContext().setAuthentication(authentication);
            //From this point forward any part of application can read from this SecurityContextHolder
            //Because of that line the Spring's Security "anyRequest().authenticated()" would had still blocked the request, because even though
            //the token is validated, that information is not yet known to Spring Security the result.


            //This filters the user in after everything is checked out on basis of Token Existed, Not Blacklisted, Not Expired, User Identity Stored.
            filterChain.doFilter(request, response);
            //THE GATE IS FINALLY OPEN TO DASHBOARD

        } catch (IOException | ServletException e) {
            throw new RuntimeException(e);
        } catch (Exception e) {
            try {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("Internal server error");
            } catch (IOException ex) {
                throw new RuntimeException(ex);
            }
        }
    }
}