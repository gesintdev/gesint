package br.com.gommo.modules.payroll.calculation;

import br.com.gommo.modules.payroll.calculation.strategy.PayrollCalculationStrategy;
import java.util.Comparator;
import java.util.List;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
public class PayrollCalculationOrchestrator {

    private final List<PayrollCalculationStrategy> strategies;

    public PayrollCalculationOrchestrator(List<PayrollCalculationStrategy> strategies) {
        this.strategies = strategies.stream()
                .sorted(Comparator.comparingInt(strategy -> {
                    Order order = AnnotationUtils.findAnnotation(strategy.getClass(), Order.class);
                    return order != null ? order.value() : 0;
                }))
                .toList();
    }

    public PayrollCalculationResult calculate(PayrollCalculationContext context) {
        for (PayrollCalculationStrategy strategy : strategies) {
            strategy.calculate(context);
        }
        return context.toResult();
    }
}
