package br.com.gommo.modules.dp.organization.jobpositioncompetency.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetencyExpectedLevelEnum;
import br.com.gommo.modules.dp.organization.jobpositioncompetency.entity.JobPositionCompetencyUsageEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.CompetencyTypeEnum;

@Getter
@Builder
public class JobPositionCompetencyResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID jobPositionId;
    private final UUID companyId;
    private final UUID competencyId;
    private final String competencyName;
    private final CompetencyTypeEnum competencyType;
    private final JobPositionCompetencyExpectedLevelEnum expectedLevel;
    private final List<JobPositionCompetencyUsageEnum> usedIn;
    private final Integer versionNumber;
    private final LocalDate validFrom;
    private final LocalDate validUntil;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
