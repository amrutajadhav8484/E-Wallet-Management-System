# Step 15: Assign Default Role During Registration

## 📋 Overview
Automatically assign ROLE_USER to new users during registration.

## 📝 Instructions

### 1. Update UserServiceImpl.java

**Open:** `src/main/java/com/exam/service/UserServiceImpl.java`

**Add imports:**
```java
import com.exam.entities.Role;
import com.exam.entities.RoleType;
import com.exam.repositories.RoleRepository;
```

**Add RoleRepository dependency:**
```java
@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RoleRepository roleRepository;  // ADD THIS
```

### 2. Update registerUser method

**Find the registerUser method and update it:**

**Find:**
```java
User user = new User();
user.setName(request.getName());
user.setMobile(request.getMobile());
user.setPassword(passwordEncoder.encode(request.getPassword()));
user.setWallet(savedWallet);

userRepository.save(user);
return new ApiResponse("Registration successful", true);
```

**Replace with:**
```java
User user = new User();
user.setName(request.getName());
user.setMobile(request.getMobile());
user.setPassword(passwordEncoder.encode(request.getPassword()));
user.setWallet(savedWallet);

// Assign default role (ROLE_USER)
Role userRole = roleRepository.findByType(RoleType.ROLE_USER)
        .orElseGet(() -> {
            // If role doesn't exist, create it
            Role newRole = new Role();
            newRole.setType(RoleType.ROLE_USER);
            return roleRepository.save(newRole);
        });
user.getRoles().add(userRole);

userRepository.save(user);
return new ApiResponse("Registration successful", true);
```

### 3. Update RoleRepository.java

**Open:** `src/main/java/com/exam/repositories/RoleRepository.java`

**Add method:**
```java
package com.exam.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.exam.entities.Role;
import com.exam.entities.RoleType;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByType(RoleType type);
}
```

### 4. Save all files

## ✅ Verification
- RoleRepository has findByType method
- New users get ROLE_USER assigned automatically
- Role is created if it doesn't exist
- Ready for role-based access control

## 📌 Notes
- Default role is ROLE_USER for all new registrations
- Role is created automatically if it doesn't exist in database
- Roles are stored in user_roles join table

## 🧪 Testing
1. Register a new user
2. Check database - user_roles table should have entry
3. User should have ROLE_USER assigned
