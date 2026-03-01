package com.exam.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter 
@Setter 
@NoArgsConstructor
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer walletId;
    
    // Initializing balance to 0.0 for safety
    private Double balance = 0.0;
    
    // Wallet PIN (hashed) - nullable for users who haven't set PIN yet
    @Column(nullable = true)
    private String pin;
}