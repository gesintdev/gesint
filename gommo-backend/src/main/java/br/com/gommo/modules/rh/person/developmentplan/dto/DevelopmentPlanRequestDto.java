package br.com.gommo.modules.rh.person.developmentplan.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.modules.rh.person.developmentplan.entity.CheckinFrequencyEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentPlanStatusEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentPlanRequestDto {
    @NotNull private UUID collaboratorId;

    private UUID targetJobPositionId;
    private String targetJobPositionName;
    private UUID managerId;
    private String managerName;
    private UUID trackId;
    private String trackName;
    private UUID originId;
    private String originName;
    private LocalDate startDate;
    private LocalDate endDate;
    private CheckinFrequencyEnum checkinFrequency;
    private Integer checkinFrequencyDays;
    private DevelopmentPlanStatusEnum planStatus;
    private String notes;

    @Builder.Default
    private List<DevelopmentPlanCompetencyItemDto> competencies = new ArrayList<>();

    @Builder.Default
    private List<DevelopmentPlanGoalItemDto> goals = new ArrayList<>();

    @Builder.Default
    private List<DevelopmentPlanCheckinItemDto> checkins = new ArrayList<>();

    @Builder.Default
    private List<DevelopmentPlanEvidenceItemDto> evidences = new ArrayList<>();
}