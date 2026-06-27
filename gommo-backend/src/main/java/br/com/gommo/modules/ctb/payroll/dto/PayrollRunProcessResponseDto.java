package br.com.gommo.modules.ctb.payroll.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.modules.ctb.payroll.entity.PayrollStatusEnum;

@Getter
@Builder
public class PayrollRunProcessResponseDto {

    private final UUID payrollRunId;
    private final PayrollStatusEnum payrollStatus;
    private final int payslipsProcessed;
    private final OffsetDateTime processedAt;
}
