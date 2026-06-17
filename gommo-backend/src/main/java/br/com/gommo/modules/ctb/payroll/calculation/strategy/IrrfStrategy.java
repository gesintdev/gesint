package br.com.gommo.modules.ctb.payroll.calculation.strategy;

import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationContext;
import br.com.gommo.modules.ctb.payroll.calculation.domain.IrrfCalculator;
import java.math.BigDecimal;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(110)
public class IrrfStrategy implements PayrollCalculationStrategy {

    @Override
    public void calculate(PayrollCalculationContext context) {
        if (!context.getEventsByCode().containsKey("IRRF")) {
            return;
        }
        BigDecimal irrf = IrrfCalculator.calculateMonthlyWithholding(context.getIrrfBase());
        if (irrf.compareTo(BigDecimal.ZERO) > 0) {
            context.addLine("IRRF", BigDecimal.ONE, irrf, irrf);
        }
    }
}
