package br.com.gommo.modules.ctb.payroll.payslip.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class PayslipResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID payrollRunId;
    private final UUID collaboratorId;
    private final BigDecimal baseSalary;
    private final BigDecimal grossAmount;
    private final BigDecimal deductionsAmount;
    private final BigDecimal netAmount;
    private final OffsetDateTime generatedAt;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
