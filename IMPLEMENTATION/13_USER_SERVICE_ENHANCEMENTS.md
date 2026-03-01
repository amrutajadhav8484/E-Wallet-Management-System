# Step 13: Enhance User Service with Profile Management

## 📋 Overview
Add methods to update user profile, change password, and get user profile.

## 📝 Instructions

### 1. Update IUserService.java

**Open:** `src/main/java/com/exam/service/IUserService.java`

**Add new method signatures:**
```java
package com.exam.service;

import com.exam.dto.*;
import java.util.List;

public interface IUserService {
    ApiResponse registerUser(SignupRequest request);
    LoginResponse loginUser(LoginRequest request);
    UserResponse getUserProfile(Integer userId);
    ApiResponse updateProfile(Integer userId, UpdateProfileRequest request);
    ApiResponse changePassword(Integer userId, ChangePasswordRequest request);
}
```

### 2. Update UserServiceImpl.java

**Open:** `src/main/java/com/exam/service/UserServiceImpl.java`

**Add imports:**
```java
import com.exam.dto.UpdateProfileRequest;
import com.exam.dto.ChangePasswordRequest;
import com.exam.dto.UserResponse;
import com.exam.exception.UnauthorizedException;
```

**Add new methods at the end of the class:**

```java
@Override
public UserResponse getUserProfile(Integer userId) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
    
    UserResponse response = new UserResponse();
    response.setUserId(user.getUserId());
    response.setName(user.getName());
    response.setMobile(user.getMobile());
    response.setWalletId(user.getWallet().getWalletId());
    response.setWalletBalance(user.getWallet().getBalance());
    
    return response;
}

@Override
public ApiResponse updateProfile(Integer userId, UpdateProfileRequest request) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
    
    user.setName(request.getName());
    userRepository.save(user);
    
    return new ApiResponse("Profile updated successfully", true);
}

@Override
public ApiResponse changePassword(Integer userId, ChangePasswordRequest request) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
    
    // Verify current password
    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
        throw new InvalidCredentialsException("Current password is incorrect");
    }
    
    // Update password
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
    
    return new ApiResponse("Password changed successfully", true);
}
```

### 3. Save the file

## ✅ Verification
- Service interface updated
- Service implementation updated
- All methods compile without errors
- Ready for next step (User Controller Enhancements)

## 📌 Notes
- getUserProfile: Returns user info with wallet balance
- updateProfile: Only updates name (mobile is unique identifier)
- changePassword: Requires current password verification
