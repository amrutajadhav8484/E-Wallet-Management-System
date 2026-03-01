package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Integer userId;
    private String name;
    private String mobile;
    private Double walletBalance;
    private Integer walletId;
    /** true if account is active, false if blocked */
    private Boolean active;
}
