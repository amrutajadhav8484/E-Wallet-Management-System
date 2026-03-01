# Step 17: Create Wallet PIN DTOs

## 📋 Overview
Create DTOs for wallet PIN operations (set PIN, verify PIN, change PIN).

## 📝 Instructions

### 1. Create SetPinRequest.java

**Create file:** `src/main/java/com/exam/dto/SetPinRequest.java`

**Copy complete code:**
```java
package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SetPinRequest {
    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "PIN must be exactly 4 digits")
    private String pin;
}
```

### 2. Create VerifyPinRequest.java

**Create file:** `src/main/java/com/exam/dto/VerifyPinRequest.java`

**Copy complete code:**
```java
package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VerifyPinRequest {
    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "PIN must be exactly 4 digits")
    private String pin;
}
```

### 3. Create ChangePinRequest.java

**Create file:** `src/main/java/com/exam/dto/ChangePinRequest.java`

**Copy complete code:**
```java
package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChangePinRequest {
    @NotBlank(message = "Current PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "Current PIN must be exactly 4 digits")
    private String currentPin;
    
    @NotBlank(message = "New PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "New PIN must be exactly 4 digits")
    private String newPin;
}
```

### 4. Save all files

## ✅ Verification
- All PIN DTOs are created
- Validation ensures PIN is exactly 4 digits
- Ready for PIN service implementation

## 📌 Notes
- PIN must be exactly 4 digits
- SetPinRequest: For first-time PIN setup
- VerifyPinRequest: For verifying PIN during transactions
- ChangePinRequest: For changing existing PIN
