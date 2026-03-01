# Step 14: Add User Profile Endpoints to Controller

## 📋 Overview
Add endpoints for getting user profile, updating profile, and changing password.

## 📝 Instructions

### 1. Update UserController.java

**Open:** `src/main/java/com/exam/controller/UserController.java`

**Add imports:**
```java
import com.exam.dto.UpdateProfileRequest;
import com.exam.dto.ChangePasswordRequest;
import com.exam.dto.UserResponse;
import com.exam.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
```

**Add JwtUtil dependency:**
```java
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final JwtUtil jwtUtil;  // ADD THIS
```

**Add new endpoints at the end of the class:**

```java
/**
 * Get current user's profile
 * Requires: Authorization header with JWT token
 */
@GetMapping("/profile")
public ResponseEntity<UserResponse> getProfile(HttpServletRequest request) {
    // Extract user ID from JWT token
    String token = request.getHeader("Authorization").substring(7);
    Integer userId = jwtUtil.extractUserId(token);
    
    return ResponseEntity.ok(userService.getUserProfile(userId));
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
    
    return ResponseEntity.ok(userService.updateProfile(userId, request));
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
    
    return ResponseEntity.ok(userService.changePassword(userId, request));
}
```

### 2. Save the file

## ✅ Verification
- Controller compiles without errors
- New endpoints are added
- Endpoints require JWT authentication
- Ready for testing

## 📌 Notes
- All new endpoints require Authorization header
- User ID is extracted from JWT token (no need to pass in URL)
- Endpoints follow RESTful conventions

## 🧪 Testing
Test with JWT token:
1. Login to get token
2. Use token in Authorization header: `Authorization: Bearer <token>`
3. Call GET `/api/v1/auth/profile` - Get user profile
4. Call PUT `/api/v1/auth/profile` - Update profile
5. Call PUT `/api/v1/auth/change-password` - Change password

## 🔧 Better Approach (Optional)
Instead of extracting token in controller, create a utility method or use Spring Security's Authentication object. This will be improved in later steps.
