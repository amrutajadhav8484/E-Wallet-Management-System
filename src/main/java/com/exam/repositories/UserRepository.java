package com.exam.repositories;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exam.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByMobile(String mobile);

    /** Find user who owns the given wallet (for KYC validation: bank mobile must match) */
    Optional<User> findByWalletWalletId(Integer walletId);

    Optional<User> findByResetPasswordTokenAndResetPasswordExpiryAfter(String resetPasswordToken, LocalDateTime after);
}
