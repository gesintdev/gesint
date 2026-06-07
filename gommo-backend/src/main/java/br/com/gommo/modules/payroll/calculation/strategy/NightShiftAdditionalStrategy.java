package br.com.gommo.modules.payroll.calculation.strategy;

import br.com.gommo.modules.payroll.calculation.PayrollCalculationContext;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(30)
public class NightShiftAdditionalStrategy implements PayrollCalculationStrategy {

    private static final BigDecimal NIGHT_RATE = new BigDecimal("0.20");

    @Override
    public void calculate(PayrollCalculationContext context) {
        if (context.getNightShiftHours().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal nightPay = context.getHourlyRate()
                .multiply(NIGHT_RATE)
                .multiply(context.getNightShiftHours())
                .setScale(2, RoundingMode.HALF_UP);
        context.setNightShiftPay(nightPay);

        if (nightPay.compareTo(BigDecimal.ZERO) > 0 && context.getEventsByCode().containsKey("ADIC_NOTURNO")) {
            context.addLine(
                    "ADIC_NOTURNO",
                    context.getNightShiftHours(),
                    context.getHourlyRate().multiply(NIGHT_RATE),
                    nightPay);
        }
    }
}
