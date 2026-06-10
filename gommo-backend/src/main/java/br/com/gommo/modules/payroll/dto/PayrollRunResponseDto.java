package br.com.gommo.modules.payroll.dto;

import lombok.*;

import java.time.*;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;

@Getter
@Builder
public class PayrollRunResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID companyId;
    private final Integer referenceYear;
    private final Integer referenceMonth;
    private final PayrollStatusEnum payrollStatus;
    private final OffsetDateTime processedAt;
    private final String notes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
