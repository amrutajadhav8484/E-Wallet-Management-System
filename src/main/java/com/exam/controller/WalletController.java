package com.exam.controller;

import com.exam.dto.*;
import com.exam.service.CurrentUserService;
import com.exam.service.IWalletService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final IWalletService walletService;
    private final CurrentUserService currentUserService;

    /** Dashboard summary (monthly spending, category-wise, top receivers). Uses JWT to resolve wallet. */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        Integer walletId = currentUserService.getCurrentUserWalletIdOrThrow();
        return ResponseEntity.ok(walletService.getDashboardSummary(walletId));
    }

    @GetMapping("/{walletId}/balance")
    public ResponseEntity<WalletResponse> getBalance(
            @PathVariable Integer walletId,
            @RequestParam @NotNull(message = "PIN is required") String pin) {
        return ResponseEntity.ok(walletService.getWalletBalance(walletId, pin));
    }

    @PostMapping("/{walletId}/add-funds")
    public ResponseEntity<ApiResponse> addFunds(
            @PathVariable Integer walletId, 
            @RequestParam @NotNull @Min(value = 1, message = "Amount must be at least 1") Double amount,
            @RequestParam @NotNull(message = "PIN is required") String pin) {
        return ResponseEntity.ok(walletService.addFunds(walletId, amount, pin));
    }

    @PostMapping("/{walletId}/withdraw")
    public ResponseEntity<ApiResponse> withdraw(
            @PathVariable Integer walletId, 
            @RequestParam @NotNull @Min(value = 1, message = "Amount must be at least 1") Double amount,
            @RequestParam @NotNull(message = "PIN is required") String pin) {
        return ResponseEntity.ok(walletService.withdrawFunds(walletId, amount, pin));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse> transfer(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(walletService.transferFunds(request));
    }

    @GetMapping("/{walletId}/history")
    public ResponseEntity<List<TransactionResponse>> getHistory(
            @PathVariable Integer walletId,
            @RequestParam @NotNull(message = "PIN is required") String pin) {
        return ResponseEntity.ok(walletService.getTransactionHistory(walletId, pin));
    }

    /**
     * Set wallet PIN (first time setup)
     * Requires: Authorization header with JWT token
     */
    @PostMapping("/{walletId}/set-pin")
    public ResponseEntity<ApiResponse> setPin(
            @PathVariable Integer walletId,
            @Valid @RequestBody SetPinRequest request) {
        ApiResponse response = walletService.setWalletPin(walletId, request);
        // Ensure response has success field set
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            // This shouldn't happen, but handle it gracefully
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Verify wallet PIN
     * Requires: Authorization header with JWT token
     */
    @PostMapping("/{walletId}/verify-pin")
    public ResponseEntity<ApiResponse> verifyPin(
            @PathVariable Integer walletId,
            @Valid @RequestBody VerifyPinRequest request) {
        return ResponseEntity.ok(walletService.verifyWalletPin(walletId, request));
    }

    /**
     * Request OTP for change PIN. Verifies current PIN, generates OTP and stores temporarily (5 min).
     * In demo, OTP is returned in response; in production send via SMS and do not return.
     */
    @PostMapping("/{walletId}/change-pin/request-otp")
    public ResponseEntity<RequestOtpResponse> requestOtpForChangePin(
            @PathVariable Integer walletId,
            @Valid @RequestBody RequestOtpForChangePinRequest request) {
        return ResponseEntity.ok(walletService.requestOtpForChangePin(walletId, request));
    }

    /**
     * Change wallet PIN using OTP. Validates OTP (one-time use) then sets new PIN.
     */
    @PutMapping("/{walletId}/change-pin")
    public ResponseEntity<ApiResponse> changePin(
            @PathVariable Integer walletId,
            @Valid @RequestBody ChangePinRequest request) {
        return ResponseEntity.ok(walletService.changeWalletPin(walletId, request));
    }
}