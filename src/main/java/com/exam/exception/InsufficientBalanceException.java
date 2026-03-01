package com.exam.exception;

/**
 * Exception thrown when wallet has insufficient balance for a transaction
 */
public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(String message) {
        super(message);
    }
    
    public InsufficientBalanceException(Double available, Double required) {
        super(String.format("Insufficient balance. Available: %.2f, Required: %.2f", available, required));
    }
}
