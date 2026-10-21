package br.com.gesint.modules.ctb.payroll.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.ctb.payroll.entity.PayrollStatusEnum;

@Getter
@Builder
public class PayrollRunResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final LocalDate referenceDate;
    private final PayrollStatusEnum payrollStatus;
    private final OffsetDateTime openedAt;
    private final OffsetDateTime closedAt;
    private final OffsetDateTime processedAt;
    private final String notes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
