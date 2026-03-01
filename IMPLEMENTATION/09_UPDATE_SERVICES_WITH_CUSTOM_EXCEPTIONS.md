# Step 9: Update Services to Use Custom Exceptions

## 📋 Overview
Replace generic RuntimeException with specific custom exceptions in service implementations.

## 📝 Instructions

### 1. Update UserServiceImpl.java

**Open:** `src/main/java/com/exam/service/UserServiceImpl.java`

**Add imports:**
```java
import com.exam.exception.DuplicateResourceException;
import com.exam.exception.InvalidCredentialsException;
import com.exam.exception.ResourceNotFoundException;
```

**Update registerUser method:**

**Find:**
```java
if (userRepository.findByMobile(request.getMobile()).isPresent()) {
    throw new RuntimeException("Mobile number already registered!");
}
```

**Replace with:**
```java
if (userRepository.findByMobile(request.getMobile()).isPresent()) {
    throw new DuplicateResourceException("User", "mobile", request.getMobile());
}
```

**Update loginUser method:**

**Find:**
```java
User user = userRepository.findByMobile(request.getMobile())
        .orElseThrow(() -> new RuntimeException("User not found"));

if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    throw new RuntimeException("Invalid credentials");
}
```

**Replace with:**
```java
User user = userRepository.findByMobile(request.getMobile())
        .orElseThrow(() -> new ResourceNotFoundException("User", "mobile", request.getMobile()));

if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    throw new InvalidCredentialsException("Invalid mobile number or password");
}
```

### 2. Update WalletServiceImpl.java

**Open:** `src/main/java/com/exam/service/WalletServiceImpl.java`

**Add imports:**
```java
import com.exam.exception.InsufficientBalanceException;
import com.exam.exception.ResourceNotFoundException;
```

**Update getWalletBalance method:**

**Find:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new RuntimeException("Wallet not found"));
```

**Replace with:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
```

**Update addFunds method:**

**Find:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new RuntimeException("Wallet not found"));
```

**Replace with:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
```

**Update withdrawFunds method:**

**Find:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new RuntimeException("Wallet not found"));

if (wallet.getBalance() < amount) {
    throw new RuntimeException("Insufficient funds for withdrawal");
}
```

**Replace with:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));

if (wallet.getBalance() < amount) {
    throw new InsufficientBalanceException(wallet.getBalance(), amount);
}
```

**Update transferFunds method:**

**Find:**
```java
Wallet source = walletRepository.findById(request.getSourceWalletId())
        .orElseThrow(() -> new RuntimeException("Source wallet not found"));
Wallet target = walletRepository.findById(request.getTargetWalletId())
        .orElseThrow(() -> new RuntimeException("Target wallet not found"));

if (source.getBalance() < request.getAmount()) {
    throw new RuntimeException("Insufficient balance for transfer");
}
```

**Replace with:**
```java
Wallet source = walletRepository.findById(request.getSourceWalletId())
        .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", request.getSourceWalletId()));
Wallet target = walletRepository.findById(request.getTargetWalletId())
        .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", request.getTargetWalletId()));

if (source.getBalance() < request.getAmount()) {
    throw new InsufficientBalanceException(source.getBalance(), request.getAmount());
}
```

### 3. Update BillPaymentServiceImpl.java

**Open:** `src/main/java/com/exam/service/BillPaymentServiceImpl.java`

**Add imports:**
```java
import com.exam.exception.InsufficientBalanceException;
import com.exam.exception.ResourceNotFoundException;
```

**Update processBill method:**

**Find:**
```java
Wallet wallet = walletRepo.findById(walletId)
        .orElseThrow(() -> new RuntimeException("Wallet not found"));

if (wallet.getBalance() < amount) {
    throw new RuntimeException("Insufficient balance for " + type);
}
```

**Replace with:**
```java
Wallet wallet = walletRepo.findById(walletId)
        .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));

if (wallet.getBalance() < amount) {
    throw new InsufficientBalanceException(wallet.getBalance(), amount);
}
```

### 4. Update BankAccountServiceImpl.java

**Open:** `src/main/java/com/exam/service/BankAccountServiceImpl.java`

**Add import:**
```java
import com.exam.exception.ResourceNotFoundException;
```

**Update linkBankToWallet method:**

**Find:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new RuntimeException("Wallet not found"));
```

**Replace with:**
```java
Wallet wallet = walletRepository.findById(walletId)
        .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
```

### 5. Save all files

## ✅ Verification
- All services compile without errors
- Custom exceptions are used instead of RuntimeException
- Error messages are more descriptive
- Appropriate HTTP status codes will be returned

## 📌 Notes
- All RuntimeException replaced with specific exceptions
- Error messages are more user-friendly
- HTTP status codes are appropriate (404 for not found, 400 for bad request, etc.)

## 🧪 Testing
Test error scenarios:
- Login with wrong credentials → 401 Unauthorized
- Access non-existent wallet → 404 Not Found
- Transfer with insufficient balance → 400 Bad Request
- Register with existing mobile → 409 Conflict
