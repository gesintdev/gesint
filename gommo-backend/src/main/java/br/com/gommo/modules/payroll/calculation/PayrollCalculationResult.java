package br.com.gommo.modules.payroll.calculation;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record PayrollCalculationResult(
        UUID collaboratorId,
        BigDecimal baseSalary,
        BigDecimal grossAmount,
        BigDecimal deductionsAmount,
        BigDecimal netAmount,
        List<CalculatedPayrollLine> lines) {}
