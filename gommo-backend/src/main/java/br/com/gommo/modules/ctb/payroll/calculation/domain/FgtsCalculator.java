package br.com.gommo.modules.ctb.payroll.calculation.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class FgtsCalculator {

    private static final BigDecimal RATE = new BigDecimal("0.08");

    private FgtsCalculator() {}

    public static BigDecimal calculateEmployerDeposit(BigDecimal fgtsBase) {
        if (fgtsBase == null || fgtsBase.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return fgtsBase.multiply(RATE).setScale(2, RoundingMode.HALF_UP);
    }
}
