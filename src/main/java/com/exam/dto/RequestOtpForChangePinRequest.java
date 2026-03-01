package com.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RequestOtpForChangePinRequest {
    @NotBlank(message = "Current PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "Current PIN must be exactly 4 digits")
    private String currentPin;
}
