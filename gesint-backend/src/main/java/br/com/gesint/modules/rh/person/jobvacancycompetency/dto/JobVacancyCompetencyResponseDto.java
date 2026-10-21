package br.com.gesint.modules.rh.person.jobvacancycompetency.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.developmentplan.entity.CompetencyTypeEnum;

@Getter
@Builder
public class JobVacancyCompetencyResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID jobVacancyId;
    private final UUID companyId;
    private final UUID competencyId;
    private final String competencyName;
    private final CompetencyTypeEnum competencyType;
    private final Integer displayOrder;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
