package br.com.gommo.modules.ctb.payroll.payslip.entry.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class PayslipEntryResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID payslipId;
    private final UUID payrollEventId;
    private final BigDecimal quantity;
    private final BigDecimal unitValue;
    private final BigDecimal totalValue;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
