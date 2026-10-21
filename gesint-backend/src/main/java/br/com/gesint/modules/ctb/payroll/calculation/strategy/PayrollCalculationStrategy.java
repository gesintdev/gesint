package br.com.gesint.modules.ctb.payroll.calculation.strategy;

import br.com.gesint.modules.ctb.payroll.calculation.PayrollCalculationContext;

public interface PayrollCalculationStrategy {

    void calculate(PayrollCalculationContext context);
}
