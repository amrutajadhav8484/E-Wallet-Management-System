package com.exam.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.exam.config.WalletConfig;
import com.exam.dto.*;
import com.exam.entities.BankAccount;
import com.exam.entities.Transaction;
import com.exam.entities.TransactionStatus;
import com.exam.entities.TransactionType;
import com.exam.entities.Wallet;
import com.exam.exception.InsufficientBalanceException;
import com.exam.exception.InvalidCredentialsException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.exception.ValidationException;
import com.exam.repositories.BankAccountRepository;
import com.exam.repositories.TransactionRepository;
import com.exam.repositories.WalletRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class WalletServiceImpl implements IWalletService {
    private static final List<TransactionType> OUTGOING_TYPES = List.of(
            TransactionType.WALLET_TO_WALLET, TransactionType.WALLET_TO_BANK, TransactionType.AUTO_PAY);

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final BankAccountRepository bankAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletConfig walletConfig;
    private final ChangePinOtpStore changePinOtpStore;

    /**
     * Helper method to verify wallet PIN
     */
    private void verifyPin(Wallet wallet, String pin) {
        if (wallet.getPin() == null) {
            throw new ValidationException("PIN not set. Please set PIN first.");
        }
        if (!passwordEncoder.matches(pin, wallet.getPin())) {
            throw new InvalidCredentialsException("Invalid PIN");
        }
    }

    /** Generate unique reference for receipts (e.g. TXN20240201123456) */
    private String generateReferenceNumber() {
        return "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).replace("-", "").toUpperCase();
    }

    /** Sum of outgoing amounts for a wallet on a given date (for daily limit) */
    private double getDailyOutgoingSum(Integer walletId, LocalDate date) {
        return transactionRepository.findByWalletWalletIdAndDate(walletId, date).stream()
                .filter(t -> OUTGOING_TYPES.contains(t.getTransactionType()))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    /** Sum of outgoing amounts for a wallet in date range (for monthly limit) */
    private double getMonthlyOutgoingSum(Integer walletId, LocalDate start, LocalDate end) {
        return transactionRepository.findByWalletWalletIdAndDateBetween(walletId, start, end).stream()
                .filter(t -> OUTGOING_TYPES.contains(t.getTransactionType()))
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    /** Enforce per-transaction, daily, and monthly limits for a debit of given amount */
    private void checkDebitLimits(Integer walletId, double amount) {
        if (amount > walletConfig.getTransactionLimit()) {
            throw new ValidationException(String.format(
                    "Amount exceeds per-transaction limit of Rs %.0f.", walletConfig.getTransactionLimit()));
        }
        LocalDate today = LocalDate.now();
        double dailyUsed = getDailyOutgoingSum(walletId, today);
        if (dailyUsed + amount > walletConfig.getDailyLimit()) {
            throw new ValidationException(String.format(
                    "Daily limit exceeded (Rs %.0f). You have already used Rs %.0f today.",
                    walletConfig.getDailyLimit(), dailyUsed));
        }
        LocalDate firstOfMonth = today.withDayOfMonth(1);
        double monthlyUsed = getMonthlyOutgoingSum(walletId, firstOfMonth, today);
        if (monthlyUsed + amount > walletConfig.getMonthlyLimit()) {
            throw new ValidationException(String.format(
                    "Monthly limit exceeded (Rs %.0f). You have already used Rs %.0f this month.",
                    walletConfig.getMonthlyLimit(), monthlyUsed));
        }
    }

    @Override
    public WalletResponse getWalletBalance(Integer walletId, String pin) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Verify PIN
        verifyPin(wallet, pin);
        
        return new WalletResponse(wallet.getWalletId(), wallet.getBalance());
    }

    @Override
    public ApiResponse addFunds(Integer walletId, Double amount, String pin) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Verify PIN
        verifyPin(wallet, pin);
        
        // Check if bank account is linked
        BankAccount bankAccount = bankAccountRepository.findByWalletWalletId(walletId)
                .orElseThrow(() -> new ValidationException("Bank account not linked. Please link a bank account first."));
        
        if (bankAccount.getBalance() == null || bankAccount.getBalance() < amount) {
            throw new InsufficientBalanceException(
                bankAccount.getBalance() != null ? bankAccount.getBalance() : 0.0, 
                amount
            );
        }
        double balanceAfter = wallet.getBalance() + amount;
        if (balanceAfter > walletConfig.getMaxBalance()) {
            throw new ValidationException(String.format(
                    "Wallet balance cannot exceed Rs %.0f. Current balance: Rs %.0f, adding Rs %.0f would exceed the limit.",
                    walletConfig.getMaxBalance(), wallet.getBalance(), amount));
        }
        bankAccount.setBalance(bankAccount.getBalance() - amount);
        wallet.setBalance(balanceAfter);
        bankAccountRepository.save(bankAccount);
        walletRepository.save(wallet);
        createTransaction(wallet, amount, "Top-up from Bank Account: " + bankAccount.getAccountNumber(), TransactionType.BANK_TO_WALLET);
        return new ApiResponse("Funds added successfully from bank account", true);
    }

    @Override
    public ApiResponse withdrawFunds(Integer walletId, Double amount, String pin) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));

        verifyPin(wallet, pin);
        if (wallet.getBalance() < amount) {
            throw new InsufficientBalanceException(wallet.getBalance(), amount);
        }
        checkDebitLimits(walletId, amount);
        double balanceAfter = wallet.getBalance() - amount;
        if (balanceAfter < walletConfig.getMinBalance()) {
            throw new ValidationException(String.format(
                    "Balance after withdrawal would be Rs %.0f. Minimum allowed balance is Rs %.0f.",
                    balanceAfter, walletConfig.getMinBalance()));
        }
        BankAccount bankAccount = bankAccountRepository.findByWalletWalletId(walletId)
                .orElseThrow(() -> new ValidationException("Bank account not linked. Please link a bank account first."));
        wallet.setBalance(balanceAfter);
        bankAccount.setBalance(bankAccount.getBalance() != null ? bankAccount.getBalance() + amount : amount);
        walletRepository.save(wallet);
        bankAccountRepository.save(bankAccount);
        createTransaction(wallet, amount, "Withdrawal to Bank Account: " + bankAccount.getAccountNumber(), TransactionType.WALLET_TO_BANK);
        return new ApiResponse("Withdrawal successful to bank account", true);
    }

    @Override
    public ApiResponse transferFunds(TransferRequest request) {
        Wallet source = walletRepository.findById(request.getSourceWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", request.getSourceWalletId()));
        Wallet target = walletRepository.findById(request.getTargetWalletId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", request.getTargetWalletId()));

        verifyPin(source, request.getPin());
        if (source.getBalance() < request.getAmount()) {
            throw new InsufficientBalanceException(source.getBalance(), request.getAmount());
        }
        checkDebitLimits(request.getSourceWalletId(), request.getAmount());
        double balanceAfter = source.getBalance() - request.getAmount();
        if (balanceAfter < walletConfig.getMinBalance()) {
            throw new ValidationException(String.format(
                    "Balance after transfer would be Rs %.0f. Minimum allowed balance is Rs %.0f.",
                    balanceAfter, walletConfig.getMinBalance()));
        }
        source.setBalance(balanceAfter);
        target.setBalance(target.getBalance() + request.getAmount());
        walletRepository.save(source);
        walletRepository.save(target);
        createTransaction(source, request.getAmount(), request.getDescription(), request.getType());
        return new ApiResponse("Transfer completed", true);
    }

    @Override
    public List<TransactionResponse> getTransactionHistory(Integer walletId, String pin) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Verify PIN
        verifyPin(wallet, pin);
        
        return transactionRepository.findByWalletWalletId(walletId).stream().map(tx -> {
            TransactionResponse res = new TransactionResponse();
            res.setTransactionId(tx.getTransactionId());
            res.setReferenceNumber(tx.getReferenceNumber());
            res.setAmount(tx.getAmount());
            res.setDate(tx.getDate());
            res.setDescription(tx.getDescription());
            res.setTransactionType(tx.getTransactionType());
            if (tx.getStatus() != null) {
                res.setStatus(tx.getStatus());
            }
            return res;
        }).collect(Collectors.toList());
    }

    @Override
    public DashboardSummaryResponse getDashboardSummary(Integer walletId) {
        List<Transaction> all = transactionRepository.findByWalletWalletId(walletId);
        List<Transaction> outgoing = all.stream()
                .filter(t -> OUTGOING_TYPES.contains(t.getTransactionType()))
                .collect(Collectors.toList());

        DateTimeFormatter monthFormat = DateTimeFormatter.ofPattern("MMM yyyy");
        LocalDate now = LocalDate.now();
        YearMonth start = YearMonth.from(now).minusMonths(5);

        Map<String, Double> byMonth = new LinkedHashMap<>();
        for (int i = 0; i < 6; i++) {
            YearMonth ym = start.plusMonths(i);
            byMonth.put(ym.format(monthFormat), 0.0);
        }
        for (Transaction t : outgoing) {
            if (t.getDate() != null && t.getAmount() != null) {
                YearMonth ym = YearMonth.from(t.getDate());
                if (!ym.isBefore(start) && !ym.isAfter(YearMonth.from(now))) {
                    String key = ym.format(monthFormat);
                    byMonth.merge(key, t.getAmount(), Double::sum);
                }
            }
        }
        List<DashboardSummaryResponse.MonthAmount> monthlySpending = byMonth.entrySet().stream()
                .map(e -> new DashboardSummaryResponse.MonthAmount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        Map<TransactionType, Double> byType = outgoing.stream()
                .filter(t -> t.getAmount() != null)
                .collect(Collectors.groupingBy(Transaction::getTransactionType,
                        Collectors.summingDouble(Transaction::getAmount)));
        Map<TransactionType, String> labels = Map.of(
                TransactionType.WALLET_TO_WALLET, "Transfer",
                TransactionType.WALLET_TO_BANK, "Withdrawal",
                TransactionType.AUTO_PAY, "Bills"
        );
        List<DashboardSummaryResponse.CategoryAmount> categoryWise = byType.entrySet().stream()
                .map(e -> new DashboardSummaryResponse.CategoryAmount(
                        e.getKey().name(),
                        labels.getOrDefault(e.getKey(), e.getKey().name()),
                        e.getValue()))
                .collect(Collectors.toList());

        Map<String, Double> receiverTotals = outgoing.stream()
                .filter(t -> t.getTransactionType() == TransactionType.WALLET_TO_WALLET && t.getDescription() != null && t.getAmount() != null)
                .collect(Collectors.groupingBy(
                        d -> d.getDescription().length() > 40 ? d.getDescription().substring(0, 40) + "…" : d.getDescription(),
                        Collectors.summingDouble(Transaction::getAmount)));
        List<DashboardSummaryResponse.ReceiverAmount> highestReceivers = receiverTotals.entrySet().stream()
                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                .limit(5)
                .map(e -> new DashboardSummaryResponse.ReceiverAmount(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return new DashboardSummaryResponse(monthlySpending, categoryWise, highestReceivers);
    }

    private void createTransaction(Wallet wallet, Double amount, String desc, TransactionType type) {
        Transaction tx = new Transaction();
        tx.setReferenceNumber(generateReferenceNumber());
        tx.setAmount(amount);
        tx.setDate(LocalDate.now());
        tx.setDescription(desc);
        tx.setTransactionType(type);
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setWallet(wallet);
        transactionRepository.save(tx);
    }

    @Override
    public ApiResponse setWalletPin(Integer walletId, SetPinRequest request) {
        // Validate wallet exists
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Check if PIN already exists
        if (wallet.getPin() != null && !wallet.getPin().isEmpty()) {
            throw new ValidationException("PIN already set. Use change PIN to update.");
        }
        
        // Validate PIN format (should be handled by DTO validation, but double-check)
        if (request.getPin() == null || request.getPin().length() != 4 || !request.getPin().matches("\\d{4}")) {
            throw new ValidationException("PIN must be exactly 4 digits");
        }
        
        // Hash and store PIN
        String hashedPin = passwordEncoder.encode(request.getPin());
        wallet.setPin(hashedPin);
        
        // Save to database
        Wallet savedWallet = walletRepository.save(wallet);
        
        // Verify PIN was saved (optional check)
        if (savedWallet.getPin() == null || savedWallet.getPin().isEmpty()) {
            throw new RuntimeException("Failed to save PIN to database");
        }
        
        // Return success response
        return new ApiResponse("PIN set successfully", true);
    }

    @Override
    public ApiResponse verifyWalletPin(Integer walletId, VerifyPinRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Check if PIN is set
        if (wallet.getPin() == null) {
            throw new ValidationException("PIN not set. Please set PIN first.");
        }
        
        // Verify PIN
        if (!passwordEncoder.matches(request.getPin(), wallet.getPin())) {
            throw new InvalidCredentialsException("Invalid PIN");
        }
        
        return new ApiResponse("PIN verified successfully", true);
    }

    @Override
    public RequestOtpResponse requestOtpForChangePin(Integer walletId, RequestOtpForChangePinRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        if (wallet.getPin() == null) {
            throw new ValidationException("PIN not set. Use set PIN first.");
        }
        if (!passwordEncoder.matches(request.getCurrentPin(), wallet.getPin())) {
            throw new InvalidCredentialsException("Current PIN is incorrect");
        }
        String otp = changePinOtpStore.generateAndStore(walletId);
        // Demo: return OTP in response (in production, send via SMS and do not return otp)
        return new RequestOtpResponse("OTP generated. Valid for 5 minutes.", true, otp);
    }

    @Override
    public ApiResponse changeWalletPin(Integer walletId, ChangePinRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        if (wallet.getPin() == null) {
            throw new ValidationException("PIN not set. Use set PIN first.");
        }
        if (!changePinOtpStore.validateAndConsume(walletId, request.getOtp())) {
            throw new InvalidCredentialsException("Invalid or expired OTP. Please request a new OTP.");
        }
        wallet.setPin(passwordEncoder.encode(request.getNewPin()));
        walletRepository.save(wallet);
        return new ApiResponse("PIN changed successfully", true);
    }
}