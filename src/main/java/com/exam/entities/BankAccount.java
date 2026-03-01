package com.exam.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class BankAccount {
    @Id
    private Integer accountNumber;
    
    private Double balance;
    private String ifscCode;
    private String bankName;

    @Column(unique = true, nullable = false)
    private String mobileNumber;

    @OneToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}