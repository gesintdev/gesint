package br.com.gommo.modules.rh.person.developmentplan.competency.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.CompetencyTypeEnum;

@Getter
@Builder
public class CompetencyResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String name;
    private final String description;
    private final CompetencyTypeEnum type;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
