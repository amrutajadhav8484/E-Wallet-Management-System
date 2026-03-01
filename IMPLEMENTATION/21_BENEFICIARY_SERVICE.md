# Step 21: Create Beneficiary Service

## 📋 Overview
Create service for managing beneficiaries (add, list, delete).

## 📝 Instructions

### 1. Create BeneficiaryRequest.java

**Create file:** `src/main/java/com/exam/dto/BeneficiaryRequest.java`

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
public class BeneficiaryRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid mobile number")
    private String mobileNo;
}
```

### 2. Create BeneficiaryResponse.java

**Create file:** `src/main/java/com/exam/dto/BeneficiaryResponse.java`

**Copy complete code:**
```java
package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryResponse {
    private Integer beneficiaryId;
    private String name;
    private String mobileNo;
}
```

### 3. Create IBeneficiaryService.java

**Create file:** `src/main/java/com/exam/service/IBeneficiaryService.java`

**Copy complete code:**
```java
package com.exam.service;

import com.exam.dto.ApiResponse;
import com.exam.dto.BeneficiaryRequest;
import com.exam.dto.BeneficiaryResponse;
import java.util.List;

public interface IBeneficiaryService {
    ApiResponse addBeneficiary(Integer walletId, BeneficiaryRequest request);
    List<BeneficiaryResponse> getBeneficiaries(Integer walletId);
    ApiResponse deleteBeneficiary(Integer beneficiaryId);
}
```

### 4. Create BeneficiaryServiceImpl.java

**Create file:** `src/main/java/com/exam/service/BeneficiaryServiceImpl.java`

**Copy complete code:**
```java
package com.exam.service;

import com.exam.dto.ApiResponse;
import com.exam.dto.BeneficiaryRequest;
import com.exam.dto.BeneficiaryResponse;
import com.exam.entities.BeneficiaryDetails;
import com.exam.entities.Wallet;
import com.exam.exception.DuplicateResourceException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.repositories.BeneficiaryDetailsRepository;
import com.exam.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements IBeneficiaryService {
    
    private final BeneficiaryDetailsRepository beneficiaryRepository;
    private final WalletRepository walletRepository;
    
    @Override
    public ApiResponse addBeneficiary(Integer walletId, BeneficiaryRequest request) {
        // Verify wallet exists
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Check if beneficiary already exists for this wallet
        boolean exists = beneficiaryRepository.findByWalletWalletIdAndMobileNo(walletId, request.getMobileNo())
                .isPresent();
        
        if (exists) {
            throw new DuplicateResourceException("Beneficiary", "mobileNo", request.getMobileNo());
        }
        
        // Create and save beneficiary
        BeneficiaryDetails beneficiary = new BeneficiaryDetails();
        beneficiary.setName(request.getName());
        beneficiary.setMobileNo(request.getMobileNo());
        beneficiary.setWallet(wallet);
        
        beneficiaryRepository.save(beneficiary);
        
        return new ApiResponse("Beneficiary added successfully", true);
    }
    
    @Override
    public List<BeneficiaryResponse> getBeneficiaries(Integer walletId) {
        // Verify wallet exists
        walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Get all beneficiaries for this wallet
        return beneficiaryRepository.findByWalletWalletId(walletId).stream()
                .map(b -> {
                    BeneficiaryResponse response = new BeneficiaryResponse();
                    response.setBeneficiaryId(b.getBeneficiaryId());
                    response.setName(b.getName());
                    response.setMobileNo(b.getMobileNo());
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public ApiResponse deleteBeneficiary(Integer beneficiaryId) {
        BeneficiaryDetails beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary", "beneficiaryId", beneficiaryId));
        
        beneficiaryRepository.delete(beneficiary);
        
        return new ApiResponse("Beneficiary deleted successfully", true);
    }
}
```

### 5. Update BeneficiaryDetailsRepository.java

**Open:** `src/main/java/com/exam/repositories/BeneficiaryDetailsRepository.java`

**Add methods:**
```java
package com.exam.repositories;

import com.exam.entities.BeneficiaryDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryDetailsRepository extends JpaRepository<BeneficiaryDetails, Integer> {
    List<BeneficiaryDetails> findByWalletWalletId(Integer walletId);
    Optional<BeneficiaryDetails> findByWalletWalletIdAndMobileNo(Integer walletId, String mobileNo);
}
```

### 6. Save all files

## ✅ Verification
- Beneficiary service created
- Repository methods added
- All methods compile without errors
- Ready for controller implementation

## 📌 Notes
- Beneficiaries are linked to wallets
- Duplicate beneficiaries (same mobile) not allowed per wallet
- Can list all beneficiaries for a wallet
- Can delete beneficiaries
