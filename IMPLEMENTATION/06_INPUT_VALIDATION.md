# Step 6: Add Input Validation

## 📋 Overview
Add validation annotations to DTOs and enable validation in controllers.

## 📝 Instructions

### 1. Update SignupRequest.java

**Open:** `src/main/java/com/exam/dto/SignupRequest.java`

**Replace entire file with:**
```java
package com.exam.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SignupRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;
    
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number. Must be 10 digits starting with 6-9")
    private String mobile;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 20, message = "Password must be between 6 and 20 characters")
    private String password;
}
```

### 2. Update LoginRequest.java

**Open:** `src/main/java/com/exam/dto/LoginRequest.java`

**Replace entire file with:**
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
public class LoginRequest {
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String mobile;
    
    @NotBlank(message = "Password is required")
    private String password;
}
```

### 3. Update TransferRequest.java

**Open:** `src/main/java/com/exam/dto/TransferRequest.java`

**Replace entire file with:**
```java
package com.exam.dto;

import com.exam.entities.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransferRequest {
    @NotNull(message = "Source wallet ID is required")
    private Integer sourceWalletId;
    
    @NotNull(message = "Target wallet ID is required")
    private Integer targetWalletId;
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    @Max(value = 100000, message = "Amount cannot exceed 100000")
    private Double amount;
    
    @NotBlank(message = "Description is required")
    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;
    
    @NotNull(message = "Transaction type is required")
    private TransactionType type;
}
```

### 4. Update UserController.java

**Open:** `src/main/java/com/exam/controller/UserController.java`

**Add import:**
```java
import jakarta.validation.Valid;
```

**Update signup method:**
```java
@PostMapping("/signup")
public ResponseEntity<ApiResponse> signup(@Valid @RequestBody SignupRequest request) {
    return new ResponseEntity<>(userService.registerUser(request), HttpStatus.CREATED);
}
```

**Update login method:**
```java
@PostMapping("/login")
public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(userService.loginUser(request));
}
```

### 5. Update WalletController.java

**Open:** `src/main/java/com/exam/controller/WalletController.java`

**Add import:**
```java
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
```

**Update methods:**
```java
@PostMapping("/{walletId}/add-funds")
public ResponseEntity<ApiResponse> addFunds(
        @PathVariable Integer walletId, 
        @RequestParam @NotNull @Min(value = 1, message = "Amount must be at least 1") Double amount) {
    return ResponseEntity.ok(walletService.addFunds(walletId, amount));
}

@PostMapping("/{walletId}/withdraw")
public ResponseEntity<ApiResponse> withdraw(
        @PathVariable Integer walletId, 
        @RequestParam @NotNull @Min(value = 1, message = "Amount must be at least 1") Double amount) {
    return ResponseEntity.ok(walletService.withdrawFunds(walletId, amount));
}

@PostMapping("/transfer")
public ResponseEntity<ApiResponse> transfer(@Valid @RequestBody TransferRequest request) {
    return ResponseEntity.ok(walletService.transferFunds(request));
}
```

### 6. Update BillPaymentController.java

**Open:** `src/main/java/com/exam/controller/BillPaymentController.java`

**Add imports:**
```java
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
```

**Update method:**
```java
@PostMapping("/pay")
public ResponseEntity<ApiResponse> payBill(
        @RequestParam @NotNull Integer walletId, 
        @RequestParam @NotNull @Min(value = 1) Double amount, 
        @RequestParam @NotNull BillType type) {
    return ResponseEntity.ok(billService.processBill(walletId, amount, type));
}
```

### 7. Save all files

## ✅ Verification
- All files compile without errors
- Validation annotations are added
- Controllers use @Valid annotation
- Ready for next step (Custom Exceptions)

## 📌 Notes
- Validation errors will be handled by exception handler (next step)
- Mobile number validation: Must be 10 digits starting with 6-9
- Password validation: 6-20 characters
- Amount validation: Minimum 1, maximum 100000

## 🧪 Testing
Try sending invalid data:
- Empty fields
- Invalid mobile number
- Password less than 6 characters
- Negative amounts

All should return validation error messages.
