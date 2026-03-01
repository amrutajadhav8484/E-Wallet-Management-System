package com.exam.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exam.entities.BankAccount;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Integer> {
    // Find bank account by mobile to verify ownership before linking
    Optional<BankAccount> findByMobileNumber(String mobileNumber);
    
    // Find bank account associated with a specific wallet
    Optional<BankAccount> findByWalletWalletId(Integer walletId);
}