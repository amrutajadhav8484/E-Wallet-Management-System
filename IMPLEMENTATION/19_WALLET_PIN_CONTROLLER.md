# Step 19: Add Wallet PIN Endpoints

## 📋 Overview
Add controller endpoints for wallet PIN operations.

## 📝 Instructions

### 1. Update WalletController.java

**Open:** `src/main/java/com/exam/controller/WalletController.java`

**Add imports:**
```java
import com.exam.dto.SetPinRequest;
import com.exam.dto.VerifyPinRequest;
import com.exam.dto.ChangePinRequest;
```

**Add new endpoints at the end of the class:**

```java
/**
 * Set wallet PIN (first time setup)
 * Requires: Authorization header with JWT token
 */
@PostMapping("/{walletId}/set-pin")
public ResponseEntity<ApiResponse> setPin(
        @PathVariable Integer walletId,
        @Valid @RequestBody SetPinRequest request) {
    return ResponseEntity.ok(walletService.setWalletPin(walletId, request));
}

/**
 * Verify wallet PIN
 * Requires: Authorization header with JWT token
 */
@PostMapping("/{walletId}/verify-pin")
public ResponseEntity<ApiResponse> verifyPin(
        @PathVariable Integer walletId,
        @Valid @RequestBody VerifyPinRequest request) {
    return ResponseEntity.ok(walletService.verifyWalletPin(walletId, request));
}

/**
 * Change wallet PIN
 * Requires: Authorization header with JWT token
 */
@PutMapping("/{walletId}/change-pin")
public ResponseEntity<ApiResponse> changePin(
        @PathVariable Integer walletId,
        @Valid @RequestBody ChangePinRequest request) {
    return ResponseEntity.ok(walletService.changeWalletPin(walletId, request));
}
```

### 2. Save the file

## ✅ Verification
- Controller compiles without errors
- PIN endpoints are added
- Endpoints require JWT authentication
- Ready for testing

## 📌 Notes
- All endpoints require Authorization header
- PIN must be exactly 4 digits (validated in DTO)
- Set PIN: First time setup
- Verify PIN: For transaction authorization
- Change PIN: Update existing PIN

## 🧪 Testing
1. Set PIN: POST `/api/v1/wallets/{walletId}/set-pin` with `{"pin": "1234"}`
2. Verify PIN: POST `/api/v1/wallets/{walletId}/verify-pin` with `{"pin": "1234"}`
3. Change PIN: PUT `/api/v1/wallets/{walletId}/change-pin` with `{"currentPin": "1234", "newPin": "5678"}`

## 🔒 Security Note
PIN is hashed before storing. Even if database is compromised, PINs cannot be retrieved.
