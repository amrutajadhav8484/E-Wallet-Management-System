package com.exam.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter 
@NoArgsConstructor
public class BillPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer billId;
    /** Reference number for receipt and support (same as linked transaction). */
    private String referenceNumber;
    private Double amount;
    private LocalDateTime time;
    
    @Enumerated(EnumType.STRING)
    private BillType billtype;

    /** Type-specific info: mobile number, consumer ID, vehicle number, subscriber ID, etc. */
    private String consumerInfo;

    /** Operator/card name (e.g. for recharge: Airtel, Jio). Optional for other types. */
    private String operatorOrCard;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}