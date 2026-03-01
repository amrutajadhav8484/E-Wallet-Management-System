package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BankAccountResponse {
    private Integer accountNumber;
    private Double balance;
    private String ifscCode;
    private String bankName;
    private String mobileNumber;
    private Integer walletId;
}
