package br.com.gommo.modules.ctb.payroll.calculation;

import br.com.gommo.modules.ctb.payroll.event.entity.PayrollEventTypeEnum;
import java.math.BigDecimal;
import java.util.UUID;

public record CalculatedPayrollLine(
        UUID payrollEventId,
        String eventCode,
        PayrollEventTypeEnum eventType,
        BigDecimal quantity,
        BigDecimal unitValue,
        BigDecimal totalValue) {}
