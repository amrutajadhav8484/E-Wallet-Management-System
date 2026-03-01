package com.exam.service;

import com.exam.dto.BillFetchResponse;
import com.exam.dto.BillPayResponse;
import com.exam.dto.BillValidateResponse;
import com.exam.entities.BillType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IBillPaymentService {
    BillPayResponse processBill(Integer walletId, Double amount, BillType type, String pin,
                                String consumerInfo, String operatorOrCard);

    Page<BillPayResponse> getHistory(Integer walletId, Pageable pageable);

    BillPayResponse getReceipt(Integer billId);

    /** Same as getReceipt but validates bill belongs to given wallet (for auth). */
    BillPayResponse getReceipt(Integer billId, Integer walletIdForAuth);

    BillValidateResponse validateConsumer(BillType billType, String consumerInfo, String operatorOrCard);

    BillFetchResponse fetchBill(BillType billType, String consumerInfo, String operatorOrCard);
}
