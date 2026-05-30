package br.com.gommo.modules.payroll.benefitenrollment.dto;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BenefitEnrollmentRequestDto {
    @NotNull private UUID collaboratorId;
    @NotNull private UUID benefitPlanId;
    @NotNull private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyValue;
    private String notes;
}
