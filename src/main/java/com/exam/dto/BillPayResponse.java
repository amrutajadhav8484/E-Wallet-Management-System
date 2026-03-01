package com.exam.dto;

import com.exam.entities.BillType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response after successful bill payment - used for receipt.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillPayResponse {
    private String message;
    private boolean success;
    private Integer billId;
    private String referenceNumber;
    private Double amount;
    private BillType billType;
    private String consumerInfo;
    private String operatorOrCard;
    private LocalDateTime paymentTime;
    private Double balanceAfter;
}
