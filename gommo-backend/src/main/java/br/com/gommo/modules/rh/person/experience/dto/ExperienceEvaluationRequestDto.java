package br.com.gommo.modules.rh.person.experience.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import br.com.gommo.modules.rh.person.experience.entity.ExperiencePeriodEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceEvaluationRequestDto {
    @NotNull
    private UUID admissionProcessId;

    private UUID collaboratorId;

    private ExperiencePeriodEnum experiencePeriod;
}
