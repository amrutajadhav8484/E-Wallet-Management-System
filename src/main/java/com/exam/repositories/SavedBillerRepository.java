package com.exam.repositories;

import com.exam.entities.SavedBiller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedBillerRepository extends JpaRepository<SavedBiller, Integer> {
    List<SavedBiller> findByWalletWalletIdOrderByCreatedAtDesc(Integer walletId);
}
