package br.com.gesint.modules.rh.person.experience.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gesint.modules.rh.person.experience.entity.ExperienceDecisionEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceDecideRequestDto {
    @NotNull
    private ExperienceDecisionEnum action;

    @Size(max = 255)
    private String reason;

    private String notes;
}
