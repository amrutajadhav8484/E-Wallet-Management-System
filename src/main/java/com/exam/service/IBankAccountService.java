package com.exam.service;

import com.exam.dto.ApiResponse;
import com.exam.dto.BankAccountResponse;
import com.exam.entities.BankAccount;

public interface IBankAccountService {
    ApiResponse linkBankToWallet(BankAccount account, Integer walletId);
    BankAccountResponse getBankAccountByWallet(Integer walletId);
}