package br.com.gommo.modules.ctb.payroll.calculation.strategy;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationContext;

@Component
@Order(10)
public class BaseSalaryStrategy implements PayrollCalculationStrategy {

    private static final BigDecimal DAYS_IN_MONTH = new BigDecimal("30");

    @Override
    public void calculate(PayrollCalculationContext context) {
        BigDecimal base = context.getBaseSalary();
        if (base.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal deduction = base.divide(DAYS_IN_MONTH, 6, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(context.getUnpaidLeaveDays()));
        BigDecimal adjusted = base.subtract(deduction).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
        context.setAdjustedBaseSalary(adjusted);

        if (context.getEventsByCode().containsKey("SAL_BASE")) {
            context.addLine("SAL_BASE", BigDecimal.ONE, adjusted, adjusted);
        }
    }
}
