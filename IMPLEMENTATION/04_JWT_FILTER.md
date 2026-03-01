# Step 4: Create JWT Authentication Filter

## 📋 Overview
Create a filter that intercepts requests, extracts JWT tokens, and validates them.

## 📝 Instructions

### 1. Create file: `src/main/java/com/exam/security/JwtAuthenticationFilter.java`

### 2. Copy the complete code below:

```java
package com.exam.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        // Get Authorization header
        final String authHeader = request.getHeader("Authorization");
        
        // If no Authorization header or doesn't start with "Bearer ", continue filter chain
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Extract token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);
            
            // Extract mobile and userId from token
            final String mobile = jwtUtil.extractMobile(jwt);
            final Integer userId = jwtUtil.extractUserId(jwt);
            
            // If mobile is extracted and no authentication exists in context
            if (mobile != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // Validate token
                if (jwtUtil.validateToken(jwt, mobile)) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        mobile,  // Principal (username)
                        null,    // Credentials (not needed for JWT)
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")) // Authorities
                    );
                    
                    // Set authentication details
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
            // Continue filter chain even if token validation fails
            // The endpoint will handle unauthorized access
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
```

### 3. Save the file

## ✅ Verification
- File compiles without errors
- JwtAuthenticationFilter class is created
- SecurityConfig should now compile (if you did Step 3)
- Ready for next step (Password Encryption)

## 📌 Notes
- Filter runs for every request
- Extracts token from "Authorization: Bearer <token>" header
- Validates token and sets authentication in security context
- If token is invalid, request continues but will be rejected by security config

## 🔧 How It Works
1. Request comes in with "Authorization: Bearer <token>"
2. Filter extracts token
3. Validates token using JwtUtil
4. If valid, sets authentication in SecurityContext
5. Spring Security allows request to proceed
