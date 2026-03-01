package com.exam.service;

import com.exam.dto.SavedBillerResponse;
import com.exam.dto.SaveBillerRequest;

import java.util.List;

public interface ISavedBillerService {
    List<SavedBillerResponse> listByWallet(Integer walletId);

    SavedBillerResponse add(Integer walletId, SaveBillerRequest request);

    void delete(Integer savedBillerId, Integer walletId);
}
