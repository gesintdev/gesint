package br.com.gesint.modules.rh.person.developmentplan.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanCancelRequestDto {
    @NotBlank private String reason;
}