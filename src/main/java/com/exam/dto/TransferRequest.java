package com.exam.dto;

import com.exam.entities.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TransferRequest {
    @NotNull(message = "Source wallet ID is required")
    private Integer sourceWalletId;
    
    @NotNull(message = "Target wallet ID is required")
    private Integer targetWalletId;
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    @Max(value = 100000, message = "Amount cannot exceed 100000")
    private Double amount;
    
    @NotBlank(message = "Description is required")
    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;
    
    @NotNull(message = "Transaction type is required")
    private TransactionType type;
    
    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "PIN must be exactly 4 digits")
    private String pin;
}