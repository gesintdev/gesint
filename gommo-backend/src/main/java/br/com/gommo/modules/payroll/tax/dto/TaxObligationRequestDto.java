package br.com.gommo.modules.payroll.tax.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.payroll.tax.entity.TaxObligationTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxObligationRequestDto {
    @NotNull private UUID collaboratorId;

    private TaxObligationTypeEnum obligationType;
    private String referenceCode;

    @NotNull private LocalDate startDate;

    private LocalDate endDate;
    private BigDecimal baseAmount;
    private BigDecimal ratePercent;
    private String notes;
}
