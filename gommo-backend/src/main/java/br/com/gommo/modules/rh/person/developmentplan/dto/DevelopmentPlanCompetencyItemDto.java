package br.com.gommo.modules.rh.person.developmentplan.dto;

import lombok.*;

import java.util.UUID;

import br.com.gommo.modules.rh.person.developmentplan.entity.GapPriorityEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanCompetencyItemDto {
    private UUID id;
    private UUID competencyId;
    private String competencyName;
    private UUID currentLevelId;
    private Integer currentLevelOrder;
    private UUID expectedLevelId;
    private Integer expectedLevelOrder;
    private Integer gap;
    private GapPriorityEnum priority;
    private String notes;
}