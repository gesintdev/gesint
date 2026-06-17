package br.com.gommo.modules.ctb.payroll.calculation.strategy;

import br.com.gommo.modules.ctb.payroll.calculation.PayrollCalculationContext;

public interface PayrollCalculationStrategy {

    void calculate(PayrollCalculationContext context);
}
