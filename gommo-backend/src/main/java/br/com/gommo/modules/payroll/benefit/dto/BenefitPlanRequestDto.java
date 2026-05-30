package br.com.gommo.modules.payroll.benefit.dto;
import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size; import java.math.BigDecimal; import java.time.LocalDate; import lombok.*;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class BenefitPlanRequestDto {
    @NotBlank @Size(max = 120) private String name; @NotBlank @Size(max = 60) private String benefitType;
    private BigDecimal monthlyValue; private String description;
    private LocalDate startDate; private LocalDate endDate;
}
