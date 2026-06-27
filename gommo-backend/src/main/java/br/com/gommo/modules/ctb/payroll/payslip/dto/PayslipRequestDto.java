package br.com.gommo.modules.ctb.payroll.payslip.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipRequestDto {

    @NotNull private UUID payrollRunId;

    @NotNull private UUID collaboratorId;

    private BigDecimal baseSalary;

    private BigDecimal grossAmount;

    private BigDecimal deductionsAmount;

    private BigDecimal netAmount;

    private OffsetDateTime generatedAt;
}
