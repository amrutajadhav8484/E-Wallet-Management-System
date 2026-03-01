package com.exam.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exam.entities.BeneficiaryDetails;

@Repository
public interface BeneficiaryDetailsRepository extends JpaRepository<BeneficiaryDetails, Integer> {
    // List all beneficiaries added to a specific wallet
    List<BeneficiaryDetails> findByWalletWalletId(Integer walletId);
    
    // Check if beneficiary already exists for a wallet
    Optional<BeneficiaryDetails> findByWalletWalletIdAndMobileNo(Integer walletId, String mobileNo);
}
