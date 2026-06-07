package br.com.gommo.modules.payroll.payslip.pdf;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record PayslipPdfDocument(
        UUID payslipId,
        Integer payslipCode,
        String competenceLabel,
        String companyName,
        String companyCnpj,
        String collaboratorName,
        String collaboratorCpf,
        BigDecimal baseSalary,
        BigDecimal grossAmount,
        BigDecimal deductionsAmount,
        BigDecimal netAmount,
        OffsetDateTime generatedAt,
        List<PayslipPdfLineItem> lines) {}
