package com.exam.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret:MySecretKeyForJWTTokenGenerationMustBeAtLeast256BitsLongForSecurityPurposes}")
    private String secret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private Long expiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    /**
     * Generate JWT token for a user
     * @param mobile User's mobile number
     * @param userId User's ID
     * @param roles List of user roles
     * @return JWT token string
     */
    public String generateToken(String mobile, Integer userId, List<String> roles) {
        return Jwts.builder()
                .subject(mobile)
                .claim("userId", userId)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Generate JWT token for a user (backward compatibility)
     * @param mobile User's mobile number
     * @param userId User's ID
     * @return JWT token string
     */
    public String generateToken(String mobile, Integer userId) {
        return generateToken(mobile, userId, List.of("ROLE_USER"));
    }
    
    /**
     * Extract mobile number from token
     */
    public String extractMobile(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    /**
     * Extract user ID from token
     */
    public Integer extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Integer.class));
    }
    
    /**
     * Extract roles from token
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        return extractClaim(token, claims -> {
            Object rolesObj = claims.get("roles");
            if (rolesObj instanceof List) {
                return (List<String>) rolesObj;
            }
            return List.of("ROLE_USER"); // Default role for backward compatibility
        });
    }
    
    /**
     * Extract expiration date from token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    /**
     * Extract a specific claim from token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Check if token is expired
     */
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    /**
     * Validate token
     * @param token JWT token
     * @param mobile User's mobile number
     * @return true if token is valid
     */
    public Boolean validateToken(String token, String mobile) {
        try {
            final String tokenMobile = extractMobile(token);
            return (tokenMobile.equals(mobile) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }
}
