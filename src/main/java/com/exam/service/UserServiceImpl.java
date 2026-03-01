package com.exam.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.exam.dto.*;
import com.exam.entities.Role;
import com.exam.entities.RoleType;
import com.exam.entities.User;
import com.exam.entities.Wallet;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.exam.exception.DuplicateResourceException;
import com.exam.exception.InvalidCredentialsException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.exception.UnauthorizedException;
import com.exam.exception.ValidationException;
import com.exam.repositories.RoleRepository;
import com.exam.repositories.UserRepository;
import com.exam.repositories.WalletRepository;
import com.exam.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RoleRepository roleRepository;
    private final NetLoggingService loggingService;

    @Override
    public ApiResponse registerUser(SignupRequest request) {
        loggingService.logDebug("Checking if user with mobile " + request.getMobile() + " already exists", 
                "UserServiceImpl", null);
        if (userRepository.findByMobile(request.getMobile()).isPresent()) {
            loggingService.logWarning("Registration failed: User with mobile " + request.getMobile() + " already exists", 
                    "UserServiceImpl", null);
            throw new DuplicateResourceException("User", "mobile", request.getMobile());
        }

        loggingService.logDebug("Creating new wallet for user registration", "UserServiceImpl", null);
        Wallet wallet = new Wallet();
        wallet.setBalance(0.0);
        Wallet savedWallet = walletRepository.save(wallet);
        loggingService.logDebug("Wallet created with ID: " + savedWallet.getWalletId(), 
                "UserServiceImpl", null);

        User user = new User();
        user.setName(request.getName());
        user.setMobile(request.getMobile());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setWallet(savedWallet);

        // Assign default role (ROLE_USER)
        Role userRole = roleRepository.findByType(RoleType.ROLE_USER)
                .orElseGet(() -> {
                    loggingService.logDebug("ROLE_USER not found, creating new role", "UserServiceImpl", null);
                    Role newRole = new Role();
                    newRole.setType(RoleType.ROLE_USER);
                    return roleRepository.save(newRole);
                });
        user.getRoles().add(userRole);
        loggingService.logDebug("Assigned ROLE_USER to new user", "UserServiceImpl", null);

        User savedUser = userRepository.save(user);
        loggingService.logInfo("User registered successfully: userId=" + savedUser.getUserId() + 
                ", mobile=" + savedUser.getMobile() + ", name=" + savedUser.getName(), 
                "UserServiceImpl", String.valueOf(savedUser.getUserId()));
        return new ApiResponse("Registration successful", true);
    }

    @Override
    public LoginResponse loginUser(LoginRequest request) {
        loggingService.logDebug("Attempting to find user with mobile: " + request.getMobile(), 
                "UserServiceImpl", null);
        User user = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> {
                    loggingService.logWarning("Login failed: User not found with mobile: " + request.getMobile(), 
                            "UserServiceImpl", null);
                    return new ResourceNotFoundException("User", "mobile", request.getMobile());
                });

        if (user.getActive() != null && !user.getActive()) {
            loggingService.logWarning("Login failed: Account blocked for mobile: " + request.getMobile(), 
                    "UserServiceImpl", null);
            throw new UnauthorizedException("Account is blocked. Please contact support.");
        }

        loggingService.logDebug("Validating password for user: " + user.getUserId(), 
                "UserServiceImpl", String.valueOf(user.getUserId()));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            loggingService.logWarning("Login failed: Invalid password for mobile: " + request.getMobile(), 
                    "UserServiceImpl", null);
            throw new InvalidCredentialsException("Invalid mobile number or password");
        }
        
        // Extract user roles
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getType().name())
                .collect(Collectors.toList());
        
        // If no roles assigned, default to ROLE_USER
        if (roles.isEmpty()) {
            loggingService.logDebug("No roles found for user " + user.getUserId() + ", assigning default ROLE_USER", 
                    "UserServiceImpl", String.valueOf(user.getUserId()));
            roles.add(RoleType.ROLE_USER.name());
        }
        
        loggingService.logDebug("Generating JWT token for user: " + user.getUserId() + " with roles: " + roles, 
                "UserServiceImpl", String.valueOf(user.getUserId()));
        // Generate JWT token with roles
        String token = jwtUtil.generateToken(user.getMobile(), user.getUserId(), roles);
        
        LoginResponse response = new LoginResponse();
        response.setMessage("Login successful");
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setMobile(user.getMobile());
        if (user.getWallet() != null) {
            response.setWalletId(user.getWallet().getWalletId());
        }
        response.setSuccess(true);
        response.setExpiresIn(86400000L); // 24 hours
        
        loggingService.logInfo("Login successful for user: userId=" + user.getUserId() + 
                ", mobile=" + user.getMobile() + ", roles=" + roles, 
                "UserServiceImpl", String.valueOf(user.getUserId()));
        return response;
    }

    @Override
    public UserResponse getUserProfile(Integer userId) {
        loggingService.logDebug("Fetching user profile for userId: " + userId, 
                "UserServiceImpl", String.valueOf(userId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    loggingService.logWarning("User profile not found for userId: " + userId, 
                            "UserServiceImpl", String.valueOf(userId));
                    return new ResourceNotFoundException("User", "userId", userId);
                });
        
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setName(user.getName());
        response.setMobile(user.getMobile());
        response.setWalletId(user.getWallet().getWalletId());
        response.setWalletBalance(user.getWallet().getBalance());
        
        loggingService.logDebug("User profile retrieved successfully for userId: " + userId, 
                "UserServiceImpl", String.valueOf(userId));
        return response;
    }

    @Override
    public ApiResponse updateProfile(Integer userId, UpdateProfileRequest request) {
        loggingService.logDebug("Updating profile for userId: " + userId, 
                "UserServiceImpl", userId.toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    loggingService.logWarning("Profile update failed: User not found for userId: " + userId, 
                            "UserServiceImpl", userId.toString());
                    return new ResourceNotFoundException("User", "userId", userId);
                });
        
        loggingService.logDebug("Updating name from '" + user.getName() + "' to '" + request.getName() + 
                "' for userId: " + userId, "UserServiceImpl", userId.toString());
        user.setName(request.getName());
        userRepository.save(user);
        
        loggingService.logInfo("Profile updated successfully for userId: " + userId, 
                "UserServiceImpl", userId.toString());
        return new ApiResponse("Profile updated successfully", true);
    }

    @Override
    public ApiResponse changePassword(Integer userId, ChangePasswordRequest request) {
        loggingService.logDebug("Password change request for userId: " + userId, 
                "UserServiceImpl", userId.toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    loggingService.logWarning("Password change failed: User not found for userId: " + userId, 
                            "UserServiceImpl", userId.toString());
                    return new ResourceNotFoundException("User", "userId", userId);
                });
        
        // Verify current password
        loggingService.logDebug("Verifying current password for userId: " + userId, 
                "UserServiceImpl", userId.toString());
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            loggingService.logWarning("Password change failed: Incorrect current password for userId: " + userId, 
                    "UserServiceImpl", userId.toString());
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        
        // Update password
        loggingService.logDebug("Updating password for userId: " + userId, 
                "UserServiceImpl", userId.toString());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        loggingService.logInfo("Password changed successfully for userId: " + userId, 
                "UserServiceImpl", userId.toString());
        return new ApiResponse("Password changed successfully", true);
    }

    @Override
    public ForgotPasswordResponse requestPasswordReset(String mobile) {
        User user = userRepository.findByMobile(mobile).orElse(null);
        if (user == null || (user.getActive() != null && !user.getActive())) {
            return new ForgotPasswordResponse(
                    "If an account exists with this mobile number, you will receive reset instructions.",
                    true, null);
        }
        String token = UUID.randomUUID().toString().replace("-", "");
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        loggingService.logInfo("Password reset requested for mobile: " + mobile, "UserServiceImpl", null);
        return new ForgotPasswordResponse(
                "Use the reset token below on the Reset Password page. Token is valid for 15 minutes. (In production this would be sent by SMS/email.)",
                true, token);
    }

    @Override
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordTokenAndResetPasswordExpiryAfter(
                request.getToken(), LocalDateTime.now()).orElse(null);
        if (user == null) {
            throw new ValidationException("Invalid or expired reset token. Please request a new one.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);
        loggingService.logInfo("Password reset successfully for userId: " + user.getUserId(), "UserServiceImpl", String.valueOf(user.getUserId()));
        return new ApiResponse("Password has been reset. You can now login with your new password.", true);
    }
}