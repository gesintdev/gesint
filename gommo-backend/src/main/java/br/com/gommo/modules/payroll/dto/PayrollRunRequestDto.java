package br.com.gommo.modules.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.modules.payroll.entity.PayrollStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRunRequestDto {
    private UUID companyId;

    @NotNull private Integer referenceYear;

    @NotNull private Integer referenceMonth;

    private PayrollStatusEnum payrollStatus;
    private OffsetDateTime processedAt;
    private String notes;
}
