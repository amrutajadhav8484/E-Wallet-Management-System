package com.exam.service;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory store for Change-PIN OTPs. OTP is stored temporarily per wallet and expires after OTP_VALID_MINUTES.
 * Interview-friendly: simple, no Redis/database required.
 */
@Component
public class ChangePinOtpStore {

    private static final int OTP_VALID_MINUTES = 5;
    private static final int OTP_LENGTH = 6;

    private final Map<Integer, OtpEntry> store = new ConcurrentHashMap<>();

    public static final class OtpEntry {
        private final String otp;
        private final long expiresAt;

        OtpEntry(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }

    /** Generate a 6-digit OTP and store it for the given wallet. Returns the OTP (e.g. for demo/SMS). */
    public String generateAndStore(Integer walletId) {
        String otp = String.format("%06d", (int) (Math.random() * 1_000_000));
        long expiresAt = System.currentTimeMillis() + (OTP_VALID_MINUTES * 60 * 1000L);
        store.put(walletId, new OtpEntry(otp, expiresAt));
        return otp;
    }

    /** Validate OTP for wallet: must match and not expired. Removes OTP on success (one-time use). */
    public boolean validateAndConsume(Integer walletId, String otp) {
        OtpEntry entry = store.get(walletId);
        if (entry == null) return false;
        if (System.currentTimeMillis() > entry.expiresAt) {
            store.remove(walletId);
            return false;
        }
        if (!entry.otp.equals(otp)) return false;
        store.remove(walletId);
        return true;
    }

    public void remove(Integer walletId) {
        store.remove(walletId);
    }
}
