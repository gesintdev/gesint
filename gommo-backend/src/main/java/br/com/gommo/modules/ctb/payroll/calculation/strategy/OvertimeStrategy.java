package br.com.gommo.modules.ctb.payroll.calculation.strategy;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationContext;

@Component
@Order(20)
public class OvertimeStrategy implements PayrollCalculationStrategy {

    private static final BigDecimal WEEKS_IN_MONTH = new BigDecimal("4.33");
    private static final BigDecimal OVERTIME_MULTIPLIER = new BigDecimal("1.5");

    @Override
    public void calculate(PayrollCalculationContext context) {
        BigDecimal monthlyHours = context.getWeeklyWorkloadHours().multiply(WEEKS_IN_MONTH);
        if (monthlyHours.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal hourlyRate = context.getAdjustedBaseSalary().divide(monthlyHours, 6, RoundingMode.HALF_UP);
        context.setHourlyRate(hourlyRate.setScale(2, RoundingMode.HALF_UP));

        BigDecimal overtimeHours =
                context.getWorkedHours().subtract(monthlyHours).max(BigDecimal.ZERO);
        context.setOvertimeHours(overtimeHours.setScale(4, RoundingMode.HALF_UP));

        BigDecimal overtimePay =
                hourlyRate.multiply(OVERTIME_MULTIPLIER).multiply(overtimeHours).setScale(2, RoundingMode.HALF_UP);
        context.setOvertimePay(overtimePay);

        if (overtimePay.compareTo(BigDecimal.ZERO) > 0
                && context.getEventsByCode().containsKey("HORA_EXTRA")) {
            context.addLine("HORA_EXTRA", overtimeHours, hourlyRate.multiply(OVERTIME_MULTIPLIER), overtimePay);
        }
    }
}
