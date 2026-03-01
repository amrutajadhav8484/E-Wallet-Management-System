# Step 11: Create LoginResponse DTO

## 📋 Overview
Create a proper DTO for login response instead of including token in message string.

## 📝 Instructions

### 1. Create file: `src/main/java/com/exam/dto/LoginResponse.java`

### 2. Copy complete code:

```java
package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String message;
    private String token;
    private Integer userId;
    private String name;
    private String mobile;
    private boolean success;
    private Long expiresIn; // Token expiration in milliseconds
}
```

### 3. Update UserServiceImpl.java

**Open:** `src/main/java/com/exam/service/UserServiceImpl.java`

**Add import:**
```java
import com.exam.dto.LoginResponse;
```

**Update IUserService interface:**

**Open:** `src/main/java/com/exam/service/IUserService.java`

**Update method signature:**
```java
LoginResponse loginUser(LoginRequest request);
```

**Update UserServiceImpl.loginUser method:**

**Find:**
```java
@Override
public ApiResponse loginUser(LoginRequest request) {
    User user = userRepository.findByMobile(request.getMobile())
            .orElseThrow(() -> new ResourceNotFoundException("User", "mobile", request.getMobile()));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new InvalidCredentialsException("Invalid mobile number or password");
    }
    
    // Generate JWT token
    String token = jwtUtil.generateToken(user.getMobile(), user.getUserId());
    
    return new ApiResponse("Welcome " + user.getName() + ". Token: " + token, true);
}
```

**Replace with:**
```java
@Override
public LoginResponse loginUser(LoginRequest request) {
    User user = userRepository.findByMobile(request.getMobile())
            .orElseThrow(() -> new ResourceNotFoundException("User", "mobile", request.getMobile()));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new InvalidCredentialsException("Invalid mobile number or password");
    }
    
    // Generate JWT token
    String token = jwtUtil.generateToken(user.getMobile(), user.getUserId());
    
    LoginResponse response = new LoginResponse();
    response.setMessage("Login successful");
    response.setToken(token);
    response.setUserId(user.getUserId());
    response.setName(user.getName());
    response.setMobile(user.getMobile());
    response.setSuccess(true);
    response.setExpiresIn(86400000L); // 24 hours
    
    return response;
}
```

### 4. Update UserController.java

**Open:** `src/main/java/com/exam/controller/UserController.java`

**Add import:**
```java
import com.exam.dto.LoginResponse;
```

**Update login method:**
```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(userService.loginUser(request));
}
```

### 5. Save all files

## ✅ Verification
- LoginResponse DTO is created
- Login endpoint returns structured response
- Token is in separate field
- User information is included

## 📌 Notes
- Better API design with structured response
- Frontend can easily extract token and user info
- Token expiration time is included

## 🧪 Testing
Login response should look like:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "name": "John Doe",
  "mobile": "9876543210",
  "success": true,
  "expiresIn": 86400000
}
```
