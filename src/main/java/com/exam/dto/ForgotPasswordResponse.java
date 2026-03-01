package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response for forgot-password. For demo, resetToken is included so user can paste it on reset page.
 * In production you would send it by email and not return it.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordResponse {
    private String message;
    private boolean success;
    /** For demo only: token to use on reset-password page. In production, send via email. */
    private String resetToken;
}
