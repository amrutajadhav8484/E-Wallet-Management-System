package com.exam.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Real-world wallet limits loaded from application.properties.
 * Used to enforce per-transaction, daily, and monthly caps.
 */
@Configuration
public class WalletConfig {

    @Value("${wallet.transaction.limit:10000}")
    private double transactionLimit;

    @Value("${wallet.daily.limit:50000}")
    private double dailyLimit;

    @Value("${wallet.monthly.limit:200000}")
    private double monthlyLimit;

    @Value("${wallet.min.balance:0.0}")
    private double minBalance;

    @Value("${wallet.max.balance:100000}")
    private double maxBalance;

    public double getTransactionLimit() {
        return transactionLimit;
    }

    public double getDailyLimit() {
        return dailyLimit;
    }

    public double getMonthlyLimit() {
        return monthlyLimit;
    }

    public double getMinBalance() {
        return minBalance;
    }

    public double getMaxBalance() {
        return maxBalance;
    }
}
