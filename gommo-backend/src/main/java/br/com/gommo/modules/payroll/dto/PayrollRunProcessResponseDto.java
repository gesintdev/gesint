package br.com.gommo.modules.payroll.dto;

import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PayrollRunProcessResponseDto {

    private final UUID payrollRunId;
    private final PayrollStatusEnum payrollStatus;
    private final int payslipsProcessed;
    private final OffsetDateTime processedAt;
}
