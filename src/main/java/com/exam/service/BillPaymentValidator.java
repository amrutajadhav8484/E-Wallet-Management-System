package com.exam.service;

import com.exam.dto.BillValidateResponse;
import com.exam.entities.BillType;
import com.exam.exception.ValidationException;

import java.util.regex.Pattern;

/**
 * Validates consumerInfo (and optionally operator) by bill type before pay.
 * Used by validate/fetch APIs and by processBill before debiting.
 */
public final class BillPaymentValidator {

    private static final Pattern TEN_DIGITS = Pattern.compile("^[0-9]{10}$");
    private static final Pattern ALPHANUMERIC_4_15 = Pattern.compile("^[A-Za-z0-9]{4,15}$");
    private static final Pattern ALPHANUMERIC_6_20 = Pattern.compile("^[A-Za-z0-9]{6,20}$");
    private static final Pattern ALPHANUMERIC_8_20 = Pattern.compile("^[A-Za-z0-9]{8,20}$");

    private BillPaymentValidator() {}

    /**
     * Validates consumer info for the given bill type. Returns a result with valid flag and message.
     */
    public static BillValidateResponse validate(BillType type, String consumerInfo, String operatorOrCard) {
        String info = consumerInfo == null ? "" : consumerInfo.trim();

        switch (type) {
            case MOBILE_RECHARGE:
            case SETUPBOX_RECHARGE:
                if (info.isEmpty()) {
                    return new BillValidateResponse(false, "Mobile number is required for " + type.name().replace("_", " ") + ".");
                }
                if (!TEN_DIGITS.matcher(info).matches()) {
                    return new BillValidateResponse(false, "Mobile number must be exactly 10 digits.");
                }
                return new BillValidateResponse(true, "Valid mobile number.");

            case FAST_TAG:
                if (info.isEmpty()) {
                    return new BillValidateResponse(false, "Vehicle number is required for Fast Tag.");
                }
                if (!ALPHANUMERIC_4_15.matcher(info).matches()) {
                    return new BillValidateResponse(false, "Vehicle number must be 4–15 alphanumeric characters.");
                }
                return new BillValidateResponse(true, "Valid vehicle number.");

            case CABLE_TV:
            case INTERNET_BILL:
            case BOOK_A_CYLINDER:
                if (info.isEmpty()) {
                    return new BillValidateResponse(false, "Subscriber / consumer ID is required for this bill type.");
                }
                if (!ALPHANUMERIC_6_20.matcher(info).matches()) {
                    return new BillValidateResponse(false, "Subscriber / consumer ID must be 6–20 alphanumeric characters.");
                }
                return new BillValidateResponse(true, "Valid consumer ID.");

            case ELECTRICITY_BILL:
            case WATER_BILL:
                if (info.isEmpty()) {
                    return new BillValidateResponse(false, "Consumer ID is required for " + type.name().replace("_", " ") + ".");
                }
                if (!ALPHANUMERIC_8_20.matcher(info).matches()) {
                    return new BillValidateResponse(false, "Consumer ID must be 8–20 alphanumeric characters.");
                }
                return new BillValidateResponse(true, "Valid consumer ID.");

            case RENT_PAYMENT:
                // Optional; allow any format or empty
                return new BillValidateResponse(true, "Valid.");

            default:
                return new BillValidateResponse(true, "Valid.");
        }
    }

    /**
     * Throws ValidationException if consumer info is invalid for the given bill type.
     */
    public static void validateOrThrow(BillType type, String consumerInfo, String operatorOrCard) {
        BillValidateResponse result = validate(type, consumerInfo, operatorOrCard);
        if (!result.isValid()) {
            throw new ValidationException(result.getMessage());
        }
    }
}
