package com.exam.dto;

import com.exam.entities.TransactionStatus;
import com.exam.entities.TransactionType;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransactionResponse {
    private Integer transactionId;
    private String referenceNumber;
    private Double amount;
    private LocalDate date;
    private String description;
    private TransactionType transactionType;
    private TransactionStatus status;
}