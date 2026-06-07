package br.com.gommo.modules.payroll.payslip.entry.dto;

import br.com.gommo.core.entity.StatusEnum;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

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
