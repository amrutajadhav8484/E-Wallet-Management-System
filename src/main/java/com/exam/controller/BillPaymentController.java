package com.exam.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.exam.dto.*;
import com.exam.entities.BillType;
import com.exam.service.BillOperatorsService;
import com.exam.service.CurrentUserService;
import com.exam.service.IBillPaymentService;
import com.exam.service.ISavedBillerService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillPaymentController {
    private final IBillPaymentService billService;
    private final CurrentUserService currentUserService;
    private final BillOperatorsService operatorsService;
    private final ISavedBillerService savedBillerService;

    @PostMapping("/pay")
    public ResponseEntity<BillPayResponse> payBill(
            @RequestParam @NotNull Integer walletId,
            @RequestParam @NotNull @Min(value = 1, message = "Amount must be at least Rs 1") Double amount,
            @RequestParam @NotNull BillType type,
            @RequestParam @NotNull(message = "PIN is required") String pin,
            @RequestParam(required = false) String consumerInfo,
            @RequestParam(required = false) String operatorOrCard) {
        currentUserService.validateWalletOwnership(walletId);
        return ResponseEntity.ok(billService.processBill(walletId, amount, type, pin, consumerInfo, operatorOrCard));
    }

    @GetMapping("/history")
    public ResponseEntity<Page<BillPayResponse>> getHistory(
            @RequestParam @NotNull Integer walletId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        currentUserService.validateWalletOwnership(walletId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "time"));
        return ResponseEntity.ok(billService.getHistory(walletId, pageable));
    }

    @GetMapping("/validate")
    public ResponseEntity<BillValidateResponse> validateConsumer(
            @RequestParam @NotNull BillType billType,
            @RequestParam(required = false) String consumerInfo,
            @RequestParam(required = false) String operatorOrCard) {
        return ResponseEntity.ok(billService.validateConsumer(billType, consumerInfo, operatorOrCard));
    }

    @GetMapping("/fetch")
    public ResponseEntity<BillFetchResponse> fetchBill(
            @RequestParam @NotNull BillType billType,
            @RequestParam(required = false) String consumerInfo,
            @RequestParam(required = false) String operatorOrCard) {
        return ResponseEntity.ok(billService.fetchBill(billType, consumerInfo, operatorOrCard));
    }

    @GetMapping("/operators")
    public ResponseEntity<List<String>> getOperators(@RequestParam @NotNull BillType billType) {
        return ResponseEntity.ok(operatorsService.getOperators(billType));
    }

    @GetMapping("/{billId}/receipt")
    public ResponseEntity<BillPayResponse> getReceipt(@PathVariable Integer billId) {
        Integer walletId = currentUserService.getCurrentUserWalletIdOrThrow();
        return ResponseEntity.ok(billService.getReceipt(billId, walletId));
    }

    @GetMapping("/saved")
    public ResponseEntity<List<SavedBillerResponse>> getSavedBillers() {
        Integer walletId = currentUserService.getCurrentUserWalletIdOrThrow();
        return ResponseEntity.ok(savedBillerService.listByWallet(walletId));
    }

    @PostMapping("/saved")
    public ResponseEntity<SavedBillerResponse> addSavedBiller(@Valid @RequestBody SaveBillerRequest request) {
        Integer walletId = currentUserService.getCurrentUserWalletIdOrThrow();
        return ResponseEntity.ok(savedBillerService.add(walletId, request));
    }

    @DeleteMapping("/saved/{savedBillerId}")
    public ResponseEntity<Void> deleteSavedBiller(@PathVariable Integer savedBillerId) {
        Integer walletId = currentUserService.getCurrentUserWalletIdOrThrow();
        savedBillerService.delete(savedBillerId, walletId);
        return ResponseEntity.noContent().build();
    }
}
