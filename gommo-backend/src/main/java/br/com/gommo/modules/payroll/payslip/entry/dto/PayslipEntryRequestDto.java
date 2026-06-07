package br.com.gommo.modules.payroll.payslip.entry.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipEntryRequestDto {

    @NotNull
    private UUID payslipId;

    @NotNull
    private UUID payrollEventId;

    private BigDecimal quantity;

    private BigDecimal unitValue;

    private BigDecimal totalValue;
}
