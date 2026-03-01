# Step 12: Create User Profile DTOs

## 📋 Overview
Create DTOs for user profile management (update profile, change password).

## 📝 Instructions

### 1. Create UpdateProfileRequest.java

**Create file:** `src/main/java/com/exam/dto/UpdateProfileRequest.java`

**Copy complete code:**
```java
package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateProfileRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;
}
```

### 2. Create ChangePasswordRequest.java

**Create file:** `src/main/java/com/exam/dto/ChangePasswordRequest.java`

**Copy complete code:**
```java
package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChangePasswordRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;
    
    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String newPassword;
}
```

### 3. Create UserResponse.java

**Create file:** `src/main/java/com/exam/dto/UserResponse.java`

**Copy complete code:**
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
public class UserResponse {
    private Integer userId;
    private String name;
    private String mobile;
    private Double walletBalance;
    private Integer walletId;
}
```

### 4. Save all files

## ✅ Verification
- All DTOs are created
- Validation annotations are added
- Ready for next step (User Service Enhancements)

## 📌 Notes
- UpdateProfileRequest: Only name can be updated (mobile is unique identifier)
- ChangePasswordRequest: Requires current password for security
- UserResponse: Returns user info with wallet balance
