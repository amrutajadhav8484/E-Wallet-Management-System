package com.exam.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "saved_biller")
public class SavedBiller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer savedBillerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillType billType;

    private String consumerInfo;
    private String operatorOrCard;

    /** Optional nickname for quick recognition (e.g. "Home electricity"). */
    private String nickname;

    private LocalDateTime createdAt = LocalDateTime.now();
}
