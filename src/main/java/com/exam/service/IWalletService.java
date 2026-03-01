package com.exam.service;

import com.exam.dto.*;
import java.util.List;

public interface IWalletService {
    WalletResponse getWalletBalance(Integer walletId, String pin);
    ApiResponse addFunds(Integer walletId, Double amount, String pin);
    ApiResponse withdrawFunds(Integer walletId, Double amount, String pin);
    ApiResponse transferFunds(TransferRequest request);
    List<TransactionResponse> getTransactionHistory(Integer walletId, String pin);
    DashboardSummaryResponse getDashboardSummary(Integer walletId);

    // PIN Management
    ApiResponse setWalletPin(Integer walletId, SetPinRequest request);
    ApiResponse verifyWalletPin(Integer walletId, VerifyPinRequest request);
    /** Generate OTP for change PIN; verify current PIN first. OTP stored temporarily. */
    RequestOtpResponse requestOtpForChangePin(Integer walletId, RequestOtpForChangePinRequest request);
    /** Validate OTP and set new PIN (one-time use of OTP). */
    ApiResponse changeWalletPin(Integer walletId, ChangePinRequest request);
}