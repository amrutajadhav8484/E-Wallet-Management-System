package com.exam.controller;

import com.exam.dto.ApiResponse;
import com.exam.dto.BeneficiaryRequest;
import com.exam.dto.BeneficiaryResponse;
import com.exam.dto.TransferToBeneficiaryRequest;
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

    /**
     * Transfer funds from logged-in user's wallet to beneficiary's wallet
     * Requires: Authorization header with JWT token
     */
    @PostMapping("/{beneficiaryId}/transfer")
    public ResponseEntity<ApiResponse> transferToBeneficiary(
            @PathVariable Integer beneficiaryId,
            @RequestParam Integer sourceWalletId,
            @Valid @RequestBody TransferToBeneficiaryRequest request) {
        return ResponseEntity.ok(beneficiaryService.transferToBeneficiary(beneficiaryId, sourceWalletId, request));
    }
}
