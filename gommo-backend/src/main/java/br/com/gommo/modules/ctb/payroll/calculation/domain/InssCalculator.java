package br.com.gommo.modules.ctb.payroll.calculation.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class InssCalculator {

    private InssCalculator() {}

    public static BigDecimal calculateEmployeeContribution(BigDecimal base) {
        if (base == null || base.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal remaining = base.min(new BigDecimal("8157.41"));
        BigDecimal total = BigDecimal.ZERO;

        total = total.add(applyBracket(remaining, BigDecimal.ZERO, new BigDecimal("1518.00"), new BigDecimal("0.075")));
        remaining = remaining.subtract(new BigDecimal("1518.00"));
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            return total.setScale(2, RoundingMode.HALF_UP);
        }

        total = total.add(applyBracket(remaining, BigDecimal.ZERO, new BigDecimal("1275.88"), new BigDecimal("0.09")));
        remaining = remaining.subtract(new BigDecimal("1275.88"));
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            return total.setScale(2, RoundingMode.HALF_UP);
        }

        total = total.add(applyBracket(remaining, BigDecimal.ZERO, new BigDecimal("1396.95"), new BigDecimal("0.12")));
        remaining = remaining.subtract(new BigDecimal("1396.95"));
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            return total.setScale(2, RoundingMode.HALF_UP);
        }

        total = total.add(applyBracket(remaining, BigDecimal.ZERO, new BigDecimal("3966.58"), new BigDecimal("0.14")));
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal applyBracket(
            BigDecimal remaining, BigDecimal min, BigDecimal maxSpan, BigDecimal rate) {
        BigDecimal span = remaining.min(maxSpan);
        if (span.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return span.multiply(rate);
    }
}
