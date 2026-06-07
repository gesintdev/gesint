package br.com.gommo.modules.payroll.calculation.strategy;

import br.com.gommo.modules.payroll.calculation.PayrollCalculationContext;
import br.com.gommo.modules.payroll.calculation.domain.FgtsCalculator;
import java.math.BigDecimal;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(120)
public class FgtsStrategy implements PayrollCalculationStrategy {

    @Override
    public void calculate(PayrollCalculationContext context) {
        if (!context.getEventsByCode().containsKey("FGTS")) {
            return;
        }
        BigDecimal fgts = FgtsCalculator.calculateEmployerDeposit(context.getFgtsBase());
        if (fgts.compareTo(BigDecimal.ZERO) > 0) {
            context.addLine("FGTS", BigDecimal.ONE, fgts, fgts);
        }
    }
}
