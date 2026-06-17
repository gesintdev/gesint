package br.com.gommo.modules.ctb.payroll.benefit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BenefitPlanRequestDto {
    @NotBlank @Size(max = 120) private String name;

    @NotBlank @Size(max = 60) private String benefitType;

    private BigDecimal monthlyValue;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
}
