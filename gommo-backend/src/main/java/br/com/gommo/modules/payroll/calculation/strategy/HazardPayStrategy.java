package br.com.gommo.modules.payroll.calculation.strategy;

import br.com.gommo.modules.payroll.calculation.PayrollCalculationContext;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(50)
public class HazardPayStrategy implements PayrollCalculationStrategy {

    @Override
    public void calculate(PayrollCalculationContext context) {
        // Reservado: depende de parametrizacao futura no contrato ou evento manual.
    }
}
