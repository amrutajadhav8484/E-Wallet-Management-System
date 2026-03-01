package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String message;
    private String token;
    private Integer userId;
    private String name;
    private String mobile;
    private Integer walletId;  // So frontend can load wallet-specific data (e.g. beneficiaries) after refresh
    private boolean success;
    private Long expiresIn; // Token expiration in milliseconds
}
