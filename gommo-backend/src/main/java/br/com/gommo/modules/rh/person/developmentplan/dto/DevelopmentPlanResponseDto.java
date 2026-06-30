package br.com.gommo.modules.rh.person.developmentplan.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.CheckinFrequencyEnum;
import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentPlanStatusEnum;

@Getter
@Builder
public class DevelopmentPlanResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final String registrationNumber;
    private final UUID jobPositionId;
    private final String jobPositionName;
    private final UUID targetJobPositionId;
    private final String targetJobPositionName;
    private final UUID departmentId;
    private final String departmentName;
    private final UUID managerId;
    private final String managerName;
    private final UUID trackId;
    private final String trackName;
    private final UUID originId;
    private final String originName;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final CheckinFrequencyEnum checkinFrequency;
    private final Integer checkinFrequencyDays;
    private final DevelopmentPlanStatusEnum planStatus;
    private final String notes;
    private final Integer progress;
    private final LocalDate lastCheckinAt;
    private final Boolean overdue;
    private final Boolean missingRecentCheckin;
    private final OffsetDateTime approvedAt;
    private final UUID approvedBy;
    private final OffsetDateTime completedAt;
    private final OffsetDateTime canceledAt;
    private final String cancelReason;

    @Builder.Default
    private final List<DevelopmentPlanCompetencyItemDto> competencies = new ArrayList<>();

    @Builder.Default
    private final List<DevelopmentPlanGoalItemDto> goals = new ArrayList<>();

    @Builder.Default
    private final List<DevelopmentPlanCheckinItemDto> checkins = new ArrayList<>();

    @Builder.Default
    private final List<DevelopmentPlanEvidenceItemDto> evidences = new ArrayList<>();

    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}