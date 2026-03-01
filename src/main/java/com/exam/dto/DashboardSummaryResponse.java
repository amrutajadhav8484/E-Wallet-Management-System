package com.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Summary for dashboard: monthly spending, category-wise expense, top receivers.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    /** Last 6 months: month label and total outgoing amount. */
    private List<MonthAmount> monthlySpending;
    /** Outgoing amount by transaction type (category). */
    private List<CategoryAmount> categoryWise;
    /** Top 5 receivers (from WALLET_TO_WALLET descriptions). */
    private List<ReceiverAmount> highestReceivers;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthAmount {
        private String month;   // e.g. "Jan 2025"
        private Double amount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryAmount {
        private String category; // e.g. "WALLET_TO_WALLET"
        private String label;    // display label
        private Double total;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiverAmount {
        private String label;   // e.g. "Transfer to 9876..."
        private Double total;
    }
}
