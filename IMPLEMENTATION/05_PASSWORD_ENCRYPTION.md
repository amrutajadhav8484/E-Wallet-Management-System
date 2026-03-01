# Step 5: Implement Password Encryption

## 📋 Overview
Update UserService to encrypt passwords using BCrypt before storing and validate encrypted passwords during login.

## 📝 Instructions

### 1. Open file: `src/main/java/com/exam/service/UserServiceImpl.java`

### 2. Add PasswordEncoder dependency

**Find this section:**
```java
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
```

**Add PasswordEncoder:**
```java
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;  // ADD THIS LINE
```

**Add import at top:**
```java
import org.springframework.security.crypto.password.PasswordEncoder;
```

### 3. Update registerUser method

**Find this code:**
```java
user.setPassword(request.getPassword()); // BCrypt should be applied here
```

**Replace with:**
```java
user.setPassword(passwordEncoder.encode(request.getPassword()));
```

### 4. Update loginUser method

**Find this code:**
```java
if (!user.getPassword().equals(request.getPassword())) {
    throw new RuntimeException("Invalid credentials");
}
```

**Replace with:**
```java
if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    throw new RuntimeException("Invalid credentials");
}
```

### 5. Update loginUser to return JWT token

**Add JwtUtil dependency:**
```java
private final UserRepository userRepository;
private final WalletRepository walletRepository;
private final PasswordEncoder passwordEncoder;
private final JwtUtil jwtUtil;  // ADD THIS LINE
```

**Add import:**
```java
import com.exam.security.JwtUtil;
```

**Update loginUser method to return token:**

**Find:**
```java
@Override
public ApiResponse loginUser(LoginRequest request) {
    User user = userRepository.findByMobile(request.getMobile())
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid credentials");
    }
    return new ApiResponse("Welcome " + user.getName(), true);
}
```

**Replace with:**
```java
@Override
public ApiResponse loginUser(LoginRequest request) {
    User user = userRepository.findByMobile(request.getMobile())
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid credentials");
    }
    
    // Generate JWT token
    String token = jwtUtil.generateToken(user.getMobile(), user.getUserId());
    
    return new ApiResponse("Welcome " + user.getName() + ". Token: " + token, true);
}
```

### 6. Save the file

## ✅ Verification
- File compiles without errors
- Passwords are now encrypted before storing
- Login validates encrypted passwords
- JWT token is returned on successful login

## 📌 Notes
- **Important**: Existing users in database have plain text passwords
- They won't be able to login until you reset their passwords
- For testing: Register new users - they will have encrypted passwords
- BCrypt automatically salts passwords for security

## 🧪 Testing
1. Register a new user
2. Check database - password should be encrypted (long hash)
3. Login with same credentials - should work
4. Login response should include JWT token

## 🔧 Better Approach (Optional)
Create a separate LoginResponse DTO instead of including token in message. 
This will be done in a later step for better API design.
