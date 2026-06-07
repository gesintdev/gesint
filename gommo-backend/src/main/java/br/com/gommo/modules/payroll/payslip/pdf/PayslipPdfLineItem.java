package br.com.gommo.modules.payroll.payslip.pdf;

import br.com.gommo.modules.payroll.event.entity.PayrollEventTypeEnum;
import java.math.BigDecimal;

public record PayslipPdfLineItem(
        String eventCode,
        String description,
        PayrollEventTypeEnum eventType,
        BigDecimal quantity,
        BigDecimal earnings,
        BigDecimal deductions) {}
