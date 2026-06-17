package br.com.gommo.modules.ctb.payroll.integration;

import java.math.BigDecimal;
import java.util.UUID;

public record ContractSalarySnapshot(
        UUID collaboratorId,
        UUID companyId,
        BigDecimal baseSalary,
        BigDecimal weeklyWorkloadHours) {}
