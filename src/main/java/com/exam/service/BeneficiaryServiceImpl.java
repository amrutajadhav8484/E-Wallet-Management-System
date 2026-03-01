package com.exam.service;

import com.exam.dto.ApiResponse;
import com.exam.dto.BeneficiaryRequest;
import com.exam.dto.BeneficiaryResponse;
import com.exam.dto.TransferRequest;
import com.exam.dto.TransferToBeneficiaryRequest;
import com.exam.entities.BeneficiaryDetails;
import com.exam.entities.TransactionType;
import com.exam.entities.User;
import com.exam.entities.Wallet;
import com.exam.exception.DuplicateResourceException;
import com.exam.exception.ResourceNotFoundException;
import com.exam.exception.ValidationException;
import com.exam.repositories.BeneficiaryDetailsRepository;
import com.exam.repositories.UserRepository;
import com.exam.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class BeneficiaryServiceImpl implements IBeneficiaryService {

    @Value("${beneficiary.max.count:20}")
    private int maxBeneficiariesPerWallet;

    private final BeneficiaryDetailsRepository beneficiaryRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final IWalletService walletService;

    @Override
    public ApiResponse addBeneficiary(Integer walletId, BeneficiaryRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));

        User walletOwner = userRepository.findByWalletWalletId(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "walletId", walletId));
        if (request.getMobileNo() != null && request.getMobileNo().trim().equals(walletOwner.getMobile())) {
            throw new ValidationException("You cannot add yourself as a beneficiary. Use transfer to another wallet instead.");
        }

        long count = beneficiaryRepository.findByWalletWalletId(walletId).size();
        if (count >= maxBeneficiariesPerWallet) {
            throw new ValidationException(String.format(
                    "Maximum %d beneficiaries allowed per wallet. Remove one to add a new beneficiary.", maxBeneficiariesPerWallet));
        }

        if (beneficiaryRepository.findByWalletWalletIdAndMobileNo(walletId, request.getMobileNo()).isPresent()) {
            throw new DuplicateResourceException("Beneficiary", "mobileNo", request.getMobileNo());
        }

        BeneficiaryDetails beneficiary = new BeneficiaryDetails();
        beneficiary.setName(request.getName());
        beneficiary.setMobileNo(request.getMobileNo());
        beneficiary.setWallet(wallet);
        beneficiaryRepository.save(beneficiary);
        return new ApiResponse("Beneficiary added successfully", true);
    }
    
    @Override
    public List<BeneficiaryResponse> getBeneficiaries(Integer walletId) {
        // Verify wallet exists
        walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        
        // Get all beneficiaries for this wallet
        return beneficiaryRepository.findByWalletWalletId(walletId).stream()
                .map(b -> {
                    BeneficiaryResponse response = new BeneficiaryResponse();
                    response.setBeneficiaryId(b.getBeneficiaryId());
                    response.setName(b.getName());
                    response.setMobileNo(b.getMobileNo());
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public ApiResponse deleteBeneficiary(Integer beneficiaryId) {
        BeneficiaryDetails beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary", "beneficiaryId", beneficiaryId));
        
        beneficiaryRepository.delete(beneficiary);
        
        return new ApiResponse("Beneficiary deleted successfully", true);
    }

    @Override
    public ApiResponse transferToBeneficiary(Integer beneficiaryId, Integer sourceWalletId, TransferToBeneficiaryRequest request) {
        BeneficiaryDetails beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary", "beneficiaryId", beneficiaryId));

        // Ensure the beneficiary belongs to the source wallet (only owner can transfer to their beneficiary)
        if (!beneficiary.getWallet().getWalletId().equals(sourceWalletId)) {
            throw new ResourceNotFoundException("Beneficiary", "beneficiaryId", beneficiaryId);
        }

        User targetUser = userRepository.findByMobile(beneficiary.getMobileNo())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Beneficiary is not registered with a wallet. Mobile: " + beneficiary.getMobileNo()));

        if (targetUser.getWallet() == null) {
            throw new ResourceNotFoundException("Beneficiary wallet not found for mobile: " + beneficiary.getMobileNo());
        }

        Integer targetWalletId = targetUser.getWallet().getWalletId();
        TransferRequest transferRequest = new TransferRequest();
        transferRequest.setSourceWalletId(sourceWalletId);
        transferRequest.setTargetWalletId(targetWalletId);
        transferRequest.setAmount(request.getAmount());
        transferRequest.setPin(request.getPin());
        transferRequest.setDescription("Transfer to beneficiary " + beneficiary.getName() + " (" + beneficiary.getMobileNo() + ")");
        transferRequest.setType(TransactionType.WALLET_TO_WALLET);

        return walletService.transferFunds(transferRequest);
    }
}
