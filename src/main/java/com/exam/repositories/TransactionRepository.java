package com.exam.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exam.entities.Transaction;
import com.exam.entities.TransactionType;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByWalletWalletId(Integer walletId);

    List<Transaction> findByTransactionType(TransactionType transactionType);

    /** For daily limit: outgoing transactions on a given date for a wallet */
    List<Transaction> findByWalletWalletIdAndDate(Integer walletId, LocalDate date);

    /** For monthly limit: outgoing transactions in date range for a wallet */
    List<Transaction> findByWalletWalletIdAndDateBetween(Integer walletId, LocalDate start, LocalDate end);
}
