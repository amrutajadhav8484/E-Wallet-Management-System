package com.exam.repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exam.entities.BillPayment;

@Repository
public interface BillPaymentRepository extends JpaRepository<BillPayment, Integer> {
    // Get all bill payments made from a specific wallet
    List<BillPayment> findByWalletWalletId(Integer walletId);

    /** Paginated history for a wallet, newest first. */
    Page<BillPayment> findByWalletWalletIdOrderByTimeDesc(Integer walletId, Pageable pageable);
}
