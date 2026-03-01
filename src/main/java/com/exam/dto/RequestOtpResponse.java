package com.exam.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response after requesting OTP for change PIN. Optional 'otp' only for demo/testing (e.g. no SMS gateway).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RequestOtpResponse {
    private String message;
    private boolean success;
    /** Only set in dev/demo when OTP is not sent via SMS; do not expose in production. */
    private String otp;
}
