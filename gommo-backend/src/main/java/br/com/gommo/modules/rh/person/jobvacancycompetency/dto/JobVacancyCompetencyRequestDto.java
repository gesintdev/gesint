package br.com.gommo.modules.rh.person.jobvacancycompetency.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyCompetencyRequestDto {

    @NotNull private UUID jobVacancyId;

    @NotNull private UUID competencyId;

    private Integer displayOrder;
}
