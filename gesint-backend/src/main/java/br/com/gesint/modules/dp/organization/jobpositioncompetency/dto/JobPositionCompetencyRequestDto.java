package br.com.gesint.modules.dp.organization.jobpositioncompetency.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetencyExpectedLevelEnum;
import br.com.gesint.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetencyUsageEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPositionCompetencyRequestDto {

    @NotNull private UUID jobPositionId;

    @NotNull private UUID competencyId;

    @NotNull private JobPositionCompetencyExpectedLevelEnum expectedLevel;

    @Builder.Default
    private List<JobPositionCompetencyUsageEnum> usedIn = new ArrayList<>();

    @NotNull private LocalDate validFrom;

    private LocalDate validUntil;
}
