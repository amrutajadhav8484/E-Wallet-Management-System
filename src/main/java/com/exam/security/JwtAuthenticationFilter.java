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

import com.exam.service.NetLoggingService;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final NetLoggingService loggingService;
    
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
                    // Extract roles from token
                    List<String> roles = jwtUtil.extractRoles(jwt);
                    
                    // Convert roles to Spring Security authorities
                    List<SimpleGrantedAuthority> authorities = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                    
                    // Create authentication token with actual roles
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        mobile,  // Principal (username)
                        null,    // Credentials (not needed for JWT)
                        authorities // Authorities from token
                    );
                    
                    // Set authentication details
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            loggingService.logError("Cannot set user authentication: " + e.getMessage(), 
                    "JwtAuthenticationFilter", null, e);
            // Continue filter chain even if token validation fails
            // The endpoint will handle unauthorized access
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
}
