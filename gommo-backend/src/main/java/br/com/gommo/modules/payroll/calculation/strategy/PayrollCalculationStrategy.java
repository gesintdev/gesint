package br.com.gommo.modules.payroll.calculation.strategy;

import br.com.gommo.modules.payroll.calculation.PayrollCalculationContext;

public interface PayrollCalculationStrategy {

    void calculate(PayrollCalculationContext context);
}
