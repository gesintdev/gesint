package br.com.gommo.modules.ctb.payroll.calculation;

import java.math.BigDecimal;
import java.util.UUID;

import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;

public record CalculatedPayrollLine(
        UUID payrollEventId,
        String eventCode,
        PayrollEventTypeEnum eventType,
        BigDecimal quantity,
        BigDecimal unitValue,
        BigDecimal totalValue) {}
