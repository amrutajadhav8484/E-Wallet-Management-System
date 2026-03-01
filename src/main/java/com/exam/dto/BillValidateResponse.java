package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response for consumer/bill validation (GET /api/bills/validate).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillValidateResponse {
    private boolean valid;
    private String message;
}
