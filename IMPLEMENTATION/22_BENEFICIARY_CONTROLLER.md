# Step 22: Create Beneficiary Controller

## 📋 Overview
Create REST controller for beneficiary management endpoints.

## 📝 Instructions

### 1. Create BeneficiaryController.java

**Create file:** `src/main/java/com/exam/controller/BeneficiaryController.java`

**Copy complete code:**
```java
package com.exam.controller;

import com.exam.dto.ApiResponse;
import com.exam.dto.BeneficiaryRequest;
import com.exam.dto.BeneficiaryResponse;
import com.exam.service.IBeneficiaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/beneficiaries")
@RequiredArgsConstructor
public class BeneficiaryController {
    
    private final IBeneficiaryService beneficiaryService;
    
    /**
     * Add a new beneficiary
     * Requires: Authorization header with JWT token
     */
    @PostMapping("/{walletId}")
    public ResponseEntity<ApiResponse> addBeneficiary(
            @PathVariable Integer walletId,
            @Valid @RequestBody BeneficiaryRequest request) {
        return ResponseEntity.ok(beneficiaryService.addBeneficiary(walletId, request));
    }
    
    /**
     * Get all beneficiaries for a wallet
     * Requires: Authorization header with JWT token
     */
    @GetMapping("/{walletId}")
    public ResponseEntity<List<BeneficiaryResponse>> getBeneficiaries(
            @PathVariable Integer walletId) {
        return ResponseEntity.ok(beneficiaryService.getBeneficiaries(walletId));
    }
    
    /**
     * Delete a beneficiary
     * Requires: Authorization header with JWT token
     */
    @DeleteMapping("/{beneficiaryId}")
    public ResponseEntity<ApiResponse> deleteBeneficiary(
            @PathVariable Integer beneficiaryId) {
        return ResponseEntity.ok(beneficiaryService.deleteBeneficiary(beneficiaryId));
    }
}
```

### 2. Save the file

## ✅ Verification
- Controller created
- All endpoints defined
- Ready for testing

## 📌 Notes
- All endpoints require JWT authentication
- Beneficiaries are wallet-specific
- Can add, list, and delete beneficiaries

## 🧪 Testing
1. Add beneficiary: POST `/api/v1/beneficiaries/{walletId}` with `{"name": "John", "mobileNo": "9876543210"}`
2. Get beneficiaries: GET `/api/v1/beneficiaries/{walletId}`
3. Delete beneficiary: DELETE `/api/v1/beneficiaries/{beneficiaryId}`
