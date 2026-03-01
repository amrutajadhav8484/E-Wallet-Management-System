package com.exam.service;

import com.exam.config.WalletConfig;
import com.exam.dto.BillFetchResponse;
import com.exam.dto.BillPayResponse;
import com.exam.dto.BillValidateResponse;
import com.exam.entities.*;
import com.exam.exception.InsufficientBalanceException;
import com.exam.exception.InvalidCredentialsException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.exception.UnauthorizedException;
import com.exam.exception.ValidationException;
import com.exam.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@Transactional
@RequiredArgsConstructor
public class BillPaymentServiceImpl implements IBillPaymentService {
    private static final List<TransactionType> OUTGOING_TYPES = List.of(
            TransactionType.WALLET_TO_WALLET, TransactionType.WALLET_TO_BANK, TransactionType.AUTO_PAY);

    private final BillPaymentRepository billRepo;
    private final WalletRepository walletRepo;
    private final TransactionRepository txRepo;
    private final PasswordEncoder passwordEncoder;
    private final WalletConfig walletConfig;
    private final NetLoggingService loggingService;

    private void verifyPin(Wallet wallet, String pin) {
        if (wallet.getPin() == null) {
            throw new ValidationException("PIN not set. Please set PIN first.");
        }
        if (!passwordEncoder.matches(pin, wallet.getPin())) {
            throw new InvalidCredentialsException("Invalid PIN");
        }
    }

    private void checkDebitLimits(Integer walletId, double amount) {
        if (amount > walletConfig.getTransactionLimit()) {
            throw new ValidationException(String.format(
                    "Amount exceeds per-transaction limit of Rs %.0f.", walletConfig.getTransactionLimit()));
        }
        LocalDate today = LocalDate.now();
        double dailyUsed = txRepo.findByWalletWalletIdAndDate(walletId, today).stream()
                .filter(t -> OUTGOING_TYPES.contains(t.getTransactionType()))
                .mapToDouble(Transaction::getAmount)
                .sum();
        if (dailyUsed + amount > walletConfig.getDailyLimit()) {
            throw new ValidationException(String.format(
                    "Daily limit exceeded (Rs %.0f). You have already used Rs %.0f today.",
                    walletConfig.getDailyLimit(), dailyUsed));
        }
        LocalDate firstOfMonth = today.withDayOfMonth(1);
        double monthlyUsed = txRepo.findByWalletWalletIdAndDateBetween(walletId, firstOfMonth, today).stream()
                .filter(t -> OUTGOING_TYPES.contains(t.getTransactionType()))
                .mapToDouble(Transaction::getAmount)
                .sum();
        if (monthlyUsed + amount > walletConfig.getMonthlyLimit()) {
            throw new ValidationException(String.format(
                    "Monthly limit exceeded (Rs %.0f). You have already used Rs %.0f this month.",
                    walletConfig.getMonthlyLimit(), monthlyUsed));
        }
    }

    private String generateReferenceNumber() {
        return "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).replace("-", "").toUpperCase();
    }

    @Override
    public BillPayResponse processBill(Integer walletId, Double amount, BillType type, String pin,
                                       String consumerInfo, String operatorOrCard) {
        if (amount == null || amount < 1) {
            throw new ValidationException("Bill amount must be at least Rs 1.");
        }
        BillPaymentValidator.validateOrThrow(type, consumerInfo, operatorOrCard);
        Wallet wallet = walletRepo.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        verifyPin(wallet, pin);
        if (wallet.getBalance() < amount) {
            throw new InsufficientBalanceException(wallet.getBalance(), amount);
        }
        checkDebitLimits(walletId, amount);
        double balanceAfter = wallet.getBalance() - amount;
        if (balanceAfter < walletConfig.getMinBalance()) {
            throw new ValidationException(String.format(
                    "Balance after payment would be Rs %.0f. Minimum allowed balance is Rs %.0f.",
                    balanceAfter, walletConfig.getMinBalance()));
        }

        wallet.setBalance(balanceAfter);
        walletRepo.save(wallet);

        String refNumber = generateReferenceNumber();
        BillPayment bill = new BillPayment();
        bill.setReferenceNumber(refNumber);
        bill.setAmount(amount);
        bill.setBilltype(type);
        bill.setTime(LocalDateTime.now());
        bill.setWallet(wallet);
        bill.setConsumerInfo(consumerInfo);
        bill.setOperatorOrCard(operatorOrCard);
        billRepo.save(bill);
        Transaction tx = new Transaction();
        tx.setReferenceNumber(refNumber);
        tx.setAmount(amount);
        tx.setDate(LocalDate.now());
        String desc = type + " Payment";
        if (consumerInfo != null && !consumerInfo.isBlank()) {
            desc += " - " + consumerInfo;
        }
        tx.setDescription(desc);
        tx.setTransactionType(TransactionType.AUTO_PAY);
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setWallet(wallet);
        txRepo.save(tx);

        BillPayResponse response = new BillPayResponse(
                type + " paid successfully",
                true,
                bill.getBillId(),
                refNumber,
                amount,
                type,
                consumerInfo,
                operatorOrCard,
                bill.getTime(),
                balanceAfter
        );
        loggingService.logInfo(String.format("Bill pay success: walletId=%d billId=%d ref=%s type=%s amount=%.2f consumer=%s operator=%s",
                walletId, bill.getBillId(), refNumber, type, amount, consumerInfo, operatorOrCard),
                "BillPaymentServiceImpl", String.valueOf(walletId));
        return response;
    }

    @Override
    public Page<BillPayResponse> getHistory(Integer walletId, Pageable pageable) {
        return billRepo.findByWalletWalletIdOrderByTimeDesc(walletId, pageable)
                .map(this::toBillPayResponse);
    }

    @Override
    public BillPayResponse getReceipt(Integer billId) {
        BillPayment bill = billRepo.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill payment", "billId", billId));
        return toBillPayResponse(bill);
    }

    @Override
    public BillPayResponse getReceipt(Integer billId, Integer walletIdForAuth) {
        BillPayment bill = billRepo.findById(billId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill payment", "billId", billId));
        if (!bill.getWallet().getWalletId().equals(walletIdForAuth)) {
            loggingService.logWarning("Receipt access denied: billId=" + billId + " requestedByWallet=" + walletIdForAuth, "BillPaymentServiceImpl", String.valueOf(walletIdForAuth));
            throw new UnauthorizedException("You do not have access to this receipt.");
        }
        loggingService.logInfo("Receipt accessed: billId=" + billId + " walletId=" + walletIdForAuth, "BillPaymentServiceImpl", String.valueOf(walletIdForAuth));
        return toBillPayResponse(bill);
    }

    @Override
    public BillValidateResponse validateConsumer(BillType billType, String consumerInfo, String operatorOrCard) {
        return BillPaymentValidator.validate(billType, consumerInfo, operatorOrCard);
    }

    @Override
    public BillFetchResponse fetchBill(BillType billType, String consumerInfo, String operatorOrCard) {
        BillValidateResponse validation = BillPaymentValidator.validate(billType, consumerInfo, operatorOrCard);
        if (!validation.isValid()) {
            return new BillFetchResponse(false, validation.getMessage(), consumerInfo, operatorOrCard, null, null, null);
        }
        // Simulated bill details (deterministic from consumer + type for demo)
        String key = (consumerInfo != null ? consumerInfo : "") + "_" + billType.name();
        int hash = Math.abs(Objects.hash(key));
        double dueAmount = 100 + (hash % 2000); // Rs 100–2100
        LocalDate dueDate = LocalDate.now().plusDays(5 + (hash % 25));
        String billerName = "Simulated " + billType.name().replace("_", " ") + " Biller";
        return new BillFetchResponse(true, "Bill fetched successfully.", consumerInfo, operatorOrCard, dueAmount, dueDate, billerName);
    }

    private BillPayResponse toBillPayResponse(BillPayment bill) {
        return new BillPayResponse(
                bill.getBilltype() + " payment",
                true,
                bill.getBillId(),
                bill.getReferenceNumber(),
                bill.getAmount(),
                bill.getBilltype(),
                bill.getConsumerInfo(),
                bill.getOperatorOrCard(),
                bill.getTime(),
                null
        );
    }
}