package br.com.gommo.modules.tax.dto;
import br.com.gommo.modules.tax.entity.TaxObligationTypeEnum;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
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
