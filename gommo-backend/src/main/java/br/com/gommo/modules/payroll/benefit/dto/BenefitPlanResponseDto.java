package br.com.gommo.modules.payroll.benefit.dto;
import br.com.gommo.core.entity.StatusEnum; import java.math.BigDecimal; import java.time.LocalDate; import java.time.OffsetDateTime; import java.util.UUID; import lombok.*;
@Getter @Builder
public class BenefitPlanResponseDto {
    private final UUID id; private final Integer code; private final StatusEnum status; private final String name; private final String benefitType;
    private final BigDecimal monthlyValue; private final String description;
    private final LocalDate startDate; private final LocalDate endDate;
    private final OffsetDateTime createdAt; private final OffsetDateTime updatedAt;
}
