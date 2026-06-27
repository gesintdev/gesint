package br.com.gommo.modules.ctb.payroll.payslip.pdf;

import java.math.BigDecimal;

import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;

public record PayslipPdfLineItem(
        String eventCode,
        String description,
        PayrollEventTypeEnum eventType,
        BigDecimal quantity,
        BigDecimal earnings,
        BigDecimal deductions) {}
