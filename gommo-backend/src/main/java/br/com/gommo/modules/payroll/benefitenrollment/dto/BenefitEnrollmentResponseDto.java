package br.com.gommo.modules.payroll.benefitenrollment.dto;
import br.com.gommo.core.entity.StatusEnum;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.*;
@Getter @Builder
public class BenefitEnrollmentResponseDto {
    private final UUID id;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final UUID benefitPlanId;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final BigDecimal monthlyValue;
    private final String notes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
