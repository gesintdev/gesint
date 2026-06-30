package br.com.gommo.modules.rh.person.developmentplan.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentActionStatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.GoalTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanGoalItemDto {
    private UUID id;
    private String title;
    private String description;
    private UUID competencyId;
    private String competencyName;
    private GoalTypeEnum type;
    private String expectedResult;
    private String successIndicator;
    private LocalDate deadline;
    private Integer weight;
    private DevelopmentActionStatusEnum status;
    private Integer progress;

    @Builder.Default
    private List<DevelopmentPlanActionItemDto> actions = new ArrayList<>();
}