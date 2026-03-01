package com.exam.service;

import com.exam.dto.ApiResponse;
import com.exam.dto.BankAccountResponse;
import com.exam.entities.BankAccount;
import com.exam.entities.User;
import com.exam.entities.Wallet;
import com.exam.exception.DuplicateResourceException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.exception.ValidationException;
import com.exam.repositories.BankAccountRepository;
import com.exam.repositories.UserRepository;
import com.exam.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class BankAccountServiceImpl implements IBankAccountService {
    /** Indian IFSC: 4 letters + 0 + 6 alphanumeric = 11 chars */
    private static final String IFSC_PATTERN = "^[A-Z]{4}0[A-Z0-9]{6}$";

    private final BankAccountRepository bankAccountRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Override
    public ApiResponse linkBankToWallet(BankAccount account, Integer walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));

        User walletOwner = userRepository.findByWalletWalletId(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "walletId", walletId));
        if (account.getMobileNumber() == null || !account.getMobileNumber().trim().equals(walletOwner.getMobile())) {
            throw new ValidationException(
                    "Bank account mobile number must match your registered wallet mobile number (KYC). Use the same mobile number used for wallet registration.");
        }

        if (account.getIfscCode() == null || !account.getIfscCode().trim().toUpperCase().matches(IFSC_PATTERN)) {
            throw new ValidationException(
                    "Invalid IFSC code. It must be 11 characters: 4 letters (bank code), 0, then 6 alphanumeric (e.g. SBIN0001234).");
        }

        if (bankAccountRepository.findByWalletWalletId(walletId).isPresent()) {
            throw new DuplicateResourceException("Bank account", "walletId", walletId);
        }
        if (bankAccountRepository.findById(account.getAccountNumber()).isPresent()) {
            throw new DuplicateResourceException("Bank account", "accountNumber", account.getAccountNumber());
        }
        if (account.getAccountNumber() == null || account.getAccountNumber() <= 0) {
            throw new ValidationException("Bank account number must be a positive number.");
        }
        if (account.getBalance() == null) {
            account.setBalance(0.0);
        }
        account.setIfscCode(account.getIfscCode().trim().toUpperCase());
        account.setWallet(wallet);
        bankAccountRepository.save(account);
        return new ApiResponse("Bank account linked successfully", true);
    }

    @Override
    public BankAccountResponse getBankAccountByWallet(Integer walletId) {
        BankAccount bankAccount = bankAccountRepository.findByWalletWalletId(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Bank account", "walletId", walletId));
        
        BankAccountResponse response = new BankAccountResponse();
        response.setAccountNumber(bankAccount.getAccountNumber());
        response.setBalance(bankAccount.getBalance());
        response.setIfscCode(bankAccount.getIfscCode());
        response.setBankName(bankAccount.getBankName());
        response.setMobileNumber(bankAccount.getMobileNumber());
        response.setWalletId(bankAccount.getWallet().getWalletId());
        
        return response;
    }
}