package br.com.gommo.modules.rh.person.developmentplan.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentActionStatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentActionTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanActionItemDto {
    private UUID id;
    private String title;
    private String description;
    private DevelopmentActionTypeEnum actionType;
    private String assignee;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer workloadHours;
    private BigDecimal estimatedCost;
    private Boolean evidenceRequired;
    private DevelopmentActionStatusEnum status;
    private Integer progress;
    private String notes;
}