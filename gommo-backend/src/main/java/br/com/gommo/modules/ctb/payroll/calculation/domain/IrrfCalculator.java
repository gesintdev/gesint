package br.com.gommo.modules.ctb.payroll.calculation.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class IrrfCalculator {

    private static final BigDecimal EXEMPT_LIMIT = new BigDecimal("2259.20");

    private IrrfCalculator() {}

    public static BigDecimal calculateMonthlyWithholding(BigDecimal taxableBase) {
        if (taxableBase == null || taxableBase.compareTo(EXEMPT_LIMIT) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal tax;
        if (taxableBase.compareTo(new BigDecimal("2826.65")) <= 0) {
            tax = taxableBase.multiply(new BigDecimal("0.075")).subtract(new BigDecimal("169.44"));
        } else if (taxableBase.compareTo(new BigDecimal("3751.05")) <= 0) {
            tax = taxableBase.multiply(new BigDecimal("0.15")).subtract(new BigDecimal("381.44"));
        } else if (taxableBase.compareTo(new BigDecimal("4664.68")) <= 0) {
            tax = taxableBase.multiply(new BigDecimal("0.225")).subtract(new BigDecimal("662.77"));
        } else {
            tax = taxableBase.multiply(new BigDecimal("0.275")).subtract(new BigDecimal("896.00"));
        }

        return tax.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }
}
