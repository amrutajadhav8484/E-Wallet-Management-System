package com.exam.service;

import com.exam.dto.SavedBillerResponse;
import com.exam.dto.SaveBillerRequest;
import com.exam.entities.SavedBiller;
import com.exam.entities.Wallet;
import com.exam.exception.ResourceNotFoundException;
import com.exam.exception.UnauthorizedException;
import com.exam.repositories.SavedBillerRepository;
import com.exam.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class SavedBillerServiceImpl implements ISavedBillerService {

    private final SavedBillerRepository savedBillerRepo;
    private final WalletRepository walletRepo;

    @Override
    public List<SavedBillerResponse> listByWallet(Integer walletId) {
        return savedBillerRepo.findByWalletWalletIdOrderByCreatedAtDesc(walletId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public SavedBillerResponse add(Integer walletId, SaveBillerRequest request) {
        Wallet wallet = walletRepo.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet", "walletId", walletId));
        SavedBiller saved = new SavedBiller();
        saved.setWallet(wallet);
        saved.setBillType(request.getBillType());
        saved.setConsumerInfo(request.getConsumerInfo());
        saved.setOperatorOrCard(request.getOperatorOrCard());
        saved.setNickname(request.getNickname());
        savedBillerRepo.save(saved);
        return toResponse(saved);
    }

    @Override
    public void delete(Integer savedBillerId, Integer walletId) {
        SavedBiller saved = savedBillerRepo.findById(savedBillerId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved biller", "id", savedBillerId));
        if (!saved.getWallet().getWalletId().equals(walletId)) {
            throw new UnauthorizedException("Saved biller does not belong to your wallet.");
        }
        savedBillerRepo.delete(saved);
    }

    private SavedBillerResponse toResponse(SavedBiller s) {
        return new SavedBillerResponse(
                s.getSavedBillerId(),
                s.getBillType(),
                s.getConsumerInfo(),
                s.getOperatorOrCard(),
                s.getNickname(),
                s.getCreatedAt()
        );
    }
}
