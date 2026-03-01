# Step 16: Add PIN Field to Wallet Entity

## 📋 Overview
Add PIN field to Wallet entity for transaction security.

## 📝 Instructions

### 1. Update Wallet.java

**Open:** `src/main/java/com/exam/entities/Wallet.java`

**Add import:**
```java
import jakarta.persistence.Column;
```

**Add PIN field:**
```java
@Entity
@Getter 
@Setter 
@NoArgsConstructor
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer walletId;
    
    // Initializing balance to 0.0 for safety
    private Double balance = 0.0;
    
    // Wallet PIN (hashed) - nullable for users who haven't set PIN yet
    @Column(nullable = true)
    private String pin;
}
```

### 2. Save the file

## ✅ Verification
- Wallet entity updated
- PIN field is nullable (users can set PIN later)
- Ready for PIN service implementation

## 📌 Notes
- PIN will be stored as hashed value (using BCrypt)
- PIN is nullable - users can set it later
- PIN is required for sensitive transactions (will be enforced in service layer)

## ⚠️ Database Migration
- Hibernate will automatically add the column on next startup (ddl-auto=update)
- Existing wallets will have null PIN
- Users need to set PIN before using it for transactions
