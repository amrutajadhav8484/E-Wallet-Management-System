package com.exam.controller;

import com.exam.dto.*;
import com.exam.security.JwtUtil;
import com.exam.service.IUserService;
import com.exam.service.NetLoggingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final JwtUtil jwtUtil;
    private final NetLoggingService loggingService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> signup(@Valid @RequestBody SignupRequest request) {
        loggingService.logInfo("User registration attempt for mobile: " + request.getMobile(), 
                "UserController", null);
        try {
            ApiResponse response = userService.registerUser(request);
            loggingService.logInfo("User registration successful for mobile: " + request.getMobile(), 
                    "UserController", null);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            loggingService.logError("User registration failed for mobile: " + request.getMobile(), 
                    "UserController", null, e);
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        loggingService.logInfo("Login attempt for mobile: " + request.getMobile(), 
                "UserController", null);
        try {
            LoginResponse response = userService.loginUser(request);
            loggingService.logInfo("Login successful for mobile: " + request.getMobile() + ", userId: " + response.getUserId(), 
                    "UserController", String.valueOf(response.getUserId()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            loggingService.logWarning("Login failed for mobile: " + request.getMobile(), 
                    "UserController", null);
            throw e;
        }
    }

    /**
     * Get current user's profile
     * Requires: Authorization header with JWT token
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        Integer userId = jwtUtil.extractUserId(token);
        loggingService.logDebug("Fetching profile for userId: " + userId, 
                "UserController", String.valueOf(userId));
        
        UserResponse response = userService.getUserProfile(userId);
        loggingService.logInfo("Profile retrieved successfully for userId: " + userId, 
                "UserController", String.valueOf(userId));
        return ResponseEntity.ok(response);
    }

    /**
     * Update user profile
     * Requires: Authorization header with JWT token
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization").substring(7);
        Integer userId = jwtUtil.extractUserId(token);
        loggingService.logInfo("Profile update request for userId: " + userId, 
                "UserController", String.valueOf(userId));
        
        ApiResponse response = userService.updateProfile(userId, request);
        loggingService.logInfo("Profile updated successfully for userId: " + userId, 
                "UserController", String.valueOf(userId));
        return ResponseEntity.ok(response);
    }

    /**
     * Change password
     * Requires: Authorization header with JWT token
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        String token = httpRequest.getHeader("Authorization").substring(7);
        Integer userId = jwtUtil.extractUserId(token);
        loggingService.logInfo("Password change request for userId: " + userId, 
                "UserController", String.valueOf(userId));
        
        ApiResponse response = userService.changePassword(userId, request);
        loggingService.logInfo("Password changed successfully for userId: " + userId, 
                "UserController", String.valueOf(userId));
        return ResponseEntity.ok(response);
    }

    /**
     * Forgot password: request a reset token for the given mobile.
     * No auth required. For demo, token is returned in response; in production send via SMS/email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        ForgotPasswordResponse response = userService.requestPasswordReset(request.getMobile());
        return ResponseEntity.ok(response);
    }

    /**
     * Reset password using the token received from forgot-password.
     * No auth required.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(userService.resetPassword(request));
    }
}