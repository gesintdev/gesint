package br.com.gommo.modules.payroll.payslip.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipRequestDto {
    @NotNull private UUID payrollRunId;

    @NotNull private UUID collaboratorId;

    private BigDecimal grossAmount;
    private BigDecimal deductionsAmount;
    private BigDecimal netAmount;
}
