package com.exam.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exam.entities.Wallet;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Integer> {
    // Basic CRUD is sufficient here as Wallet is linked via other entities
}
