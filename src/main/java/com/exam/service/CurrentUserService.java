package com.exam.service;

import com.exam.entities.User;
import com.exam.exception.UnauthorizedException;
import com.exam.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Resolves current logged-in user and wallet from JWT (SecurityContext).
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepo;

    /**
     * Current user's mobile (JWT subject / principal). Empty if not authenticated.
     */
    public Optional<String> getCurrentUserMobile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return Optional.empty();
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof String) {
            return Optional.of((String) principal);
        }
        return Optional.empty();
    }

    /**
     * Current user's wallet ID if logged in and user has a wallet. Used to validate pay/history/receipt.
     */
    public Optional<Integer> getCurrentUserWalletId() {
        return getCurrentUserMobile()
                .flatMap(userRepo::findByMobile)
                .map(User::getWallet)
                .filter(w -> w != null)
                .map(w -> w.getWalletId());
    }

    /**
     * Throws UnauthorizedException if current user's wallet ID does not match the given walletId.
     */
    public void validateWalletOwnership(Integer walletId) {
        Optional<Integer> current = getCurrentUserWalletId();
        if (current.isEmpty()) {
            throw new UnauthorizedException("Not authenticated.");
        }
        if (!current.get().equals(walletId)) {
            throw new UnauthorizedException("Wallet does not belong to the logged-in user.");
        }
    }

    /**
     * Returns current user's wallet ID or throws UnauthorizedException if not available.
     */
    public Integer getCurrentUserWalletIdOrThrow() {
        return getCurrentUserWalletId()
                .orElseThrow(() -> new UnauthorizedException("Not authenticated or no wallet linked."));
    }
}
