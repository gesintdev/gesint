package br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentActionTypeEnum;

@Getter
@Builder
public class DevelopmentActionTemplateResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID competencyId;
    private final String competencyName;
    private final Integer minGap;
    private final String title;
    private final String suggestedDescription;
    private final DevelopmentActionTypeEnum actionType;
    private final Integer suggestedDeadlineDays;
    private final Boolean evidenceRequired;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
