package com.exam.service;

import com.exam.entities.BillType;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Static list of operators/billers per bill type for UI dropdown.
 */
@Service
public class BillOperatorsService {

    private static final Map<BillType, List<String>> OPERATORS_BY_TYPE = Map.of(
            BillType.MOBILE_RECHARGE, List.of("Airtel", "Jio", "Vi", "BSNL", "MTNL"),
            BillType.SETUPBOX_RECHARGE, List.of("Airtel DTH", "Tata Play", "Dish TV", "Sun Direct"),
            BillType.FAST_TAG, List.of("ICICI", "HDFC", "Paytm", "Airtel"),
            BillType.CABLE_TV, List.of("Hathway", "ACT", "Asianet", "Siti Cable"),
            BillType.INTERNET_BILL, List.of("Airtel", "Jio Fiber", "ACT", "BSNL", "Hathway"),
            BillType.ELECTRICITY_BILL, List.of("State Discom", "Tata Power", "Adani", "Torrent"),
            BillType.WATER_BILL, List.of("Municipal Corporation", "Jal Board", "Local Board"),
            BillType.BOOK_A_CYLINDER, List.of("Indane", "HP", "Bharat Gas"),
            BillType.RENT_PAYMENT, List.of("Landlord", "Society", "Other")
    );

    public List<String> getOperators(BillType billType) {
        return OPERATORS_BY_TYPE.getOrDefault(billType, Collections.emptyList());
    }
}
