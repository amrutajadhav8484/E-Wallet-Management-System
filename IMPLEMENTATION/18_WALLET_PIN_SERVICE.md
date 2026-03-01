# Step 18: Implement Wallet PIN Service Methods

## 📋 Overview
Add PIN management methods to wallet service (set, verify, change PIN).

## 📝 Instructions

### 1. Update IWalletService.java

**Open:** `src/main/java/com/exam/service/IWalletService.java`

**Add imports and new method signatures:**
```java
package com.exam.service;

import com.exam.dto.*;
import java.util.List;

public interface IWalletService {
    WalletResponse getWalletBalance(Integer walletId);
    ApiResponse addFunds(Integer walletId, Double amount);
    ApiResponse withdrawFunds(Integer walletId, Double amount);
    ApiResponse transferFunds(TransferRequest request);
    List<TransactionResponse> getTransactionHistory(Integer walletId);
    
    // PIN Management
    ApiResponse setWalletPin(Integer walletId, SetPinRequest request);
    ApiResponse verifyWalletPin(Integer walletId, VerifyPinRequest request);
    ApiResponse changeWalletPin(Integer walletId, ChangePinRequest request);
}
```

### 2. Update WalletServiceImpl.java

**Open:** `src/main/java/com/exam/service/WalletServiceImpl.java`

**Add imports:**
```java
import com.exam.dto.SetPinRequest;
import com.exam.dto.VerifyPinRequest;
import com.exam.dto.ChangePinRequest;
import com.exam.exception.ValidationException;
import org.springframework.security.crypto.password.PasswordEncoder;
```

**Add PasswordEncoder dependency:**
```java
@Service
@Transactional
@RequiredArgsConstructor
public class WalletServiceImpl implements IWalletService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;  // ADD THIS
```

**Add new methods at the end of the class:**

```java
@Override
public ApiResponse setWalletPin(Integer walletId, SetPinRequest request) {
    Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
    
    // Check if PIN already exists
    if (wallet.getPin() != null) {
        throw new ValidationException("PIN already set. Use change PIN to update.");
    }
    
    // Hash and store PIN
    wallet.setPin(passwordEncoder.encode(request.getPin()));
    walletRepository.save(wallet);
    
    return new ApiResponse("PIN set successfully", true);
}

@Override
public ApiResponse verifyWalletPin(Integer walletId, VerifyPinRequest request) {
    Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
    
    // Check if PIN is set
    if (wallet.getPin() == null) {
        throw new ValidationException("PIN not set. Please set PIN first.");
    }
    
    // Verify PIN
    if (!passwordEncoder.matches(request.getPin(), wallet.getPin())) {
        throw new InvalidCredentialsException("Invalid PIN");
    }
    
    return new ApiResponse("PIN verified successfully", true);
}

@Override
public ApiResponse changeWalletPin(Integer walletId, ChangePinRequest request) {
    Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
    
    // Check if PIN is set
    if (wallet.getPin() == null) {
        throw new ValidationException("PIN not set. Use set PIN first.");
    }
    
    // Verify current PIN
    if (!passwordEncoder.matches(request.getCurrentPin(), wallet.getPin())) {
        throw new InvalidCredentialsException("Current PIN is incorrect");
    }
    
    // Update PIN
    wallet.setPin(passwordEncoder.encode(request.getNewPin()));
    walletRepository.save(wallet);
    
    return new ApiResponse("PIN changed successfully", true);
}
```

**Add missing import:**
```java
import com.exam.exception.InvalidCredentialsException;
```

### 3. Save the file

## ✅ Verification
- Service interface updated
- Service implementation updated
- PIN methods compile without errors
- Ready for PIN controller implementation

## 📌 Notes
- PIN is hashed using BCrypt (same as passwords)
- PIN must be set before it can be used
- Current PIN must be verified before changing
- PIN verification can be used for sensitive transactions
