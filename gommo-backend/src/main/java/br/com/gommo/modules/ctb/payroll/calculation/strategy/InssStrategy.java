package br.com.gommo.modules.ctb.payroll.calculation.strategy;

import java.math.BigDecimal;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationContext;
import br.com.gommo.modules.ctb.payroll.calculation.domain.InssCalculator;

@Component
@Order(100)
public class InssStrategy implements PayrollCalculationStrategy {

    @Override
    public void calculate(PayrollCalculationContext context) {
        if (!context.getEventsByCode().containsKey("INSS")) {
            return;
        }
        BigDecimal inss = InssCalculator.calculateEmployeeContribution(context.getInssBase());
        if (inss.compareTo(BigDecimal.ZERO) > 0) {
            context.addLine("INSS", BigDecimal.ONE, inss, inss);
        }
    }
}
