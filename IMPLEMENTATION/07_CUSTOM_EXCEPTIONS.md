# Step 7: Create Custom Exception Classes

## 📋 Overview
Create specific exception classes to replace generic RuntimeException for better error handling.

## 📝 Instructions

### 1. Create ResourceNotFoundException.java

**Create file:** `src/main/java/com/exam/exception/ResourceNotFoundException.java`

**Copy complete code:**
```java
package com.exam.exception;

/**
 * Exception thrown when a requested resource is not found
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
```

### 2. Create InsufficientBalanceException.java

**Create file:** `src/main/java/com/exam/exception/InsufficientBalanceException.java`

**Copy complete code:**
```java
package com.exam.exception;

/**
 * Exception thrown when wallet has insufficient balance for a transaction
 */
public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(String message) {
        super(message);
    }
    
    public InsufficientBalanceException(Double available, Double required) {
        super(String.format("Insufficient balance. Available: %.2f, Required: %.2f", available, required));
    }
}
```

### 3. Create ValidationException.java

**Create file:** `src/main/java/com/exam/exception/ValidationException.java`

**Copy complete code:**
```java
package com.exam.exception;

/**
 * Exception thrown when validation fails
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
```

### 4. Create DuplicateResourceException.java

**Create file:** `src/main/java/com/exam/exception/DuplicateResourceException.java`

**Copy complete code:**
```java
package com.exam.exception;

/**
 * Exception thrown when trying to create a resource that already exists
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
    
    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s already exists with %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
```

### 5. Create UnauthorizedException.java

**Create file:** `src/main/java/com/exam/exception/UnauthorizedException.java`

**Copy complete code:**
```java
package com.exam.exception;

/**
 * Exception thrown when user is not authorized to perform an action
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

### 6. Create InvalidCredentialsException.java

**Create file:** `src/main/java/com/exam/exception/InvalidCredentialsException.java`

**Copy complete code:**
```java
package com.exam.exception;

/**
 * Exception thrown when login credentials are invalid
 */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
```

### 7. Save all files

## ✅ Verification
- All exception classes compile without errors
- Ready for next step (Update Exception Handler)

## 📌 Notes
- These exceptions will be caught by GlobalExceptionHandler
- Each exception has a specific purpose
- Can add more exceptions as needed

## 🔧 Usage Examples (will be used in services)
```java
// Instead of:
throw new RuntimeException("User not found");

// Use:
throw new ResourceNotFoundException("User", "mobile", mobile);

// Instead of:
throw new RuntimeException("Insufficient balance");

// Use:
throw new InsufficientBalanceException(wallet.getBalance(), amount);
```
