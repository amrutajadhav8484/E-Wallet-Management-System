# Step 20: Add Transaction Status Tracking

## 📋 Overview
Add transaction status (PENDING, SUCCESS, FAILED) to track transaction states.

## 📝 Instructions

### 1. Create TransactionStatus.java enum

**Create file:** `src/main/java/com/exam/entities/TransactionStatus.java`

**Copy complete code:**
```java
package com.exam.entities;

public enum TransactionStatus {
    PENDING,
    SUCCESS,
    FAILED,
    REVERSED
}
```

### 2. Update Transaction.java

**Open:** `src/main/java/com/exam/entities/Transaction.java`

**Add status field:**
```java
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer transactionId;
    
    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;
    
    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.SUCCESS; // Default to SUCCESS
    
    private LocalDate date;
    private Double amount;
    private String description;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}
```

### 3. Update TransactionResponse.java

**Open:** `src/main/java/com/exam/dto/TransactionResponse.java`

**Add status field:**
```java
package com.exam.dto;

import com.exam.entities.TransactionStatus;
import com.exam.entities.TransactionType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class TransactionResponse {
    private Integer transactionId;
    private TransactionType transactionType;
    private TransactionStatus status;  // ADD THIS
    private LocalDate date;
    private Double amount;
    private String description;
}
```

### 4. Update WalletServiceImpl.java

**Open:** `src/main/java/com/exam/service/WalletServiceImpl.java`

**Add import:**
```java
import com.exam.entities.TransactionStatus;
```

**Update createTransaction method:**

**Find:**
```java
private void createTransaction(Wallet wallet, Double amount, String desc, TransactionType type) {
    Transaction tx = new Transaction();
    tx.setAmount(amount);
    tx.setDate(LocalDate.now());
    tx.setDescription(desc);
    tx.setTransactionType(type);
    tx.setWallet(wallet);
    transactionRepository.save(tx);
}
```

**Replace with:**
```java
private void createTransaction(Wallet wallet, Double amount, String desc, TransactionType type) {
    Transaction tx = new Transaction();
    tx.setAmount(amount);
    tx.setDate(LocalDate.now());
    tx.setDescription(desc);
    tx.setTransactionType(type);
    tx.setStatus(TransactionStatus.SUCCESS);
    tx.setWallet(wallet);
    transactionRepository.save(tx);
}
```

**Update getTransactionHistory method:**

**Find:**
```java
res.setTransactionId(tx.getTransactionId());
res.setAmount(tx.getAmount());
res.setDate(tx.getDate());
res.setDescription(tx.getDescription());
res.setTransactionType(tx.getTransactionType());
```

**Replace with:**
```java
res.setTransactionId(tx.getTransactionId());
res.setAmount(tx.getAmount());
res.setDate(tx.getDate());
res.setDescription(tx.getDescription());
res.setTransactionType(tx.getTransactionType());
res.setStatus(tx.getStatus());
```

### 5. Save all files

## ✅ Verification
- TransactionStatus enum created
- Transaction entity updated
- TransactionResponse updated
- Service methods updated
- Ready for use

## 📌 Notes
- Default status is SUCCESS for existing transactions
- Status can be used to track failed transactions
- REVERSED status for refunded transactions
- Can filter transactions by status in future
