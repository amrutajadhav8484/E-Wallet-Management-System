package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {
    private Integer walletId; // Consistent with your Wallet entity
    private Double balance;   // Consistent with your Wallet entity
}
