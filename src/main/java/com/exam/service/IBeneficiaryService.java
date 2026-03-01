package com.exam.service;

import com.exam.dto.ApiResponse;
import com.exam.dto.BeneficiaryRequest;
import com.exam.dto.BeneficiaryResponse;
import com.exam.dto.TransferToBeneficiaryRequest;
import java.util.List;

public interface IBeneficiaryService {
    ApiResponse addBeneficiary(Integer walletId, BeneficiaryRequest request);
    List<BeneficiaryResponse> getBeneficiaries(Integer walletId);
    ApiResponse deleteBeneficiary(Integer beneficiaryId);
    ApiResponse transferToBeneficiary(Integer beneficiaryId, Integer sourceWalletId, TransferToBeneficiaryRequest request);
}
