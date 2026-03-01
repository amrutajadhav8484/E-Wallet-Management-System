package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Response for fetch bill (GET /api/bills/fetch). Includes validation and simulated bill details.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BillFetchResponse {
    private boolean valid;
    private String message;
    private String consumerInfo;
    private String operatorOrCard;
    /** Simulated due amount (e.g. from biller). */
    private Double dueAmount;
    /** Simulated due date. */
    private LocalDate dueDate;
    /** Simulated biller name. */
    private String billerName;
}
