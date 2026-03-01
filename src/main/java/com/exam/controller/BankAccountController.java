package com.exam.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.exam.dto.ApiResponse;
import com.exam.dto.BankAccountResponse;
import com.exam.entities.BankAccount;
import com.exam.service.IBankAccountService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/bank-accounts")
@RequiredArgsConstructor
public class BankAccountController {
    private final IBankAccountService bankAccountService;

    /**
     * Link bank account to wallet
     * Requires: Authorization header with JWT token
     */
    @PostMapping("/link")
    public ResponseEntity<ApiResponse> linkAccount(
            @RequestBody BankAccount account, 
            @RequestParam Integer walletId) {
        return ResponseEntity.ok(bankAccountService.linkBankToWallet(account, walletId));
    }

    /**
     * Get bank account details for a wallet
     * Requires: Authorization header with JWT token
     */
    @GetMapping("/wallet/{walletId}")
    public ResponseEntity<BankAccountResponse> getBankAccountByWallet(
            @PathVariable Integer walletId) {
        return ResponseEntity.ok(bankAccountService.getBankAccountByWallet(walletId));
    }
}