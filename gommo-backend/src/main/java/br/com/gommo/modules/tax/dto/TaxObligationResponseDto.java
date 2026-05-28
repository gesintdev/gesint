package br.com.gommo.modules.tax.dto;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.tax.entity.TaxObligationTypeEnum;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Getter @Builder
public class TaxObligationResponseDto {
    private final UUID id;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final TaxObligationTypeEnum obligationType;
    private final String referenceCode;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal baseAmount;
    private final BigDecimal ratePercent;
    private final String notes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
