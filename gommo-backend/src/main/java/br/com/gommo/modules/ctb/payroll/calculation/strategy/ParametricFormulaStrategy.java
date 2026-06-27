package br.com.gommo.modules.ctb.payroll.calculation.strategy;

import java.math.BigDecimal;
import java.util.Set;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationContext;
import br.com.gommo.modules.ctb.payroll.calculation.domain.PayrollFormulaEvaluator;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEvent;
import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;

@Component
@Order(60)
public class ParametricFormulaStrategy implements PayrollCalculationStrategy {

    private static final Set<String> RESERVED_CODES =
            Set.of("SAL_BASE", "HORA_EXTRA", "ADIC_NOTURNO", "INSALUBRIDADE", "PERICULOSIDADE", "INSS", "IRRF", "FGTS");

    @Override
    public void calculate(PayrollCalculationContext context) {
        for (PayrollEvent event : context.getEventsByCode().values()) {
            if (RESERVED_CODES.contains(event.getEventCode())
                    || context.getAppliedEventCodes().contains(event.getEventCode())) {
                continue;
            }
            if (event.getFormula() == null || event.getFormula().isBlank()) {
                continue;
            }
            if (event.getEventType() == PayrollEventTypeEnum.DEDUCTION
                    || event.getEventType() == PayrollEventTypeEnum.INFORMATIVE) {
                continue;
            }

            BigDecimal total = PayrollFormulaEvaluator.evaluate(event.getFormula(), context.formulaVariables());
            context.addLine(event.getEventCode(), BigDecimal.ONE, total, total);
        }
    }
}
