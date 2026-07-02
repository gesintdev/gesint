package br.com.gommo.modules.rh.person.developmentplan.mapper;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import br.com.gommo.modules.rh.person.developmentplan.dto.*;
import br.com.gommo.modules.rh.person.developmentplan.entity.*;

@Component
public class DevelopmentPlanMapper {

    public DevelopmentPlan toEntity(DevelopmentPlanRequestDto dto) {
        DevelopmentPlan entity = DevelopmentPlan.builder().build();
        applyScalarFields(entity, dto, true);
        reconcileCompetencies(entity, dto.getCompetencies());
        reconcileGoals(entity, dto.getGoals());
        reconcileCheckins(entity, dto.getCheckins());
        reconcileEvidences(entity, dto.getEvidences());
        recalculate(entity);
        return entity;
    }

    public void updateEntity(DevelopmentPlan entity, DevelopmentPlanRequestDto dto) {
        applyScalarFields(entity, dto, false);
        reconcileCompetencies(entity, dto.getCompetencies());
        reconcileGoals(entity, dto.getGoals());
        reconcileCheckins(entity, dto.getCheckins());
        reconcileEvidences(entity, dto.getEvidences());
        recalculate(entity);
    }

    public DevelopmentPlanResponseDto toResponse(DevelopmentPlan entity) {
        recalculate(entity);
        return DevelopmentPlanResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorName(entity.getCollaboratorName())
                .registrationNumber(entity.getRegistrationNumber())
                .jobPositionId(entity.getJobPositionId())
                .jobPositionName(entity.getJobPositionName())
                .targetJobPositionId(entity.getTargetJobPositionId())
                .targetJobPositionName(entity.getTargetJobPositionName())
                .departmentId(entity.getDepartmentId())
                .departmentName(entity.getDepartmentName())
                .managerId(entity.getManagerId())
                .managerName(entity.getManagerName())
                .trackId(entity.getTrackId())
                .trackName(entity.getTrackName())
                .originId(entity.getOriginId())
                .originName(entity.getOriginName())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .checkinFrequency(entity.getCheckinFrequency())
                .checkinFrequencyDays(entity.getCheckinFrequencyDays())
                .planStatus(entity.getPlanStatus())
                .notes(entity.getNotes())
                .progress(entity.getProgress())
                .lastCheckinAt(entity.getLastCheckinAt())
                .overdue(isOverdue(entity))
                .missingRecentCheckin(isMissingRecentCheckin(entity))
                .approvedAt(entity.getApprovedAt())
                .approvedBy(entity.getApprovedBy())
                .completedAt(entity.getCompletedAt())
                .canceledAt(entity.getCanceledAt())
                .cancelReason(entity.getCancelReason())
                .competencies(entity.getCompetencies().stream().map(this::toCompetencyDto).toList())
                .goals(entity.getGoals().stream().map(this::toGoalDto).toList())
                .checkins(entity.getCheckins().stream().map(this::toCheckinDto).toList())
                .evidences(entity.getEvidences().stream().map(this::toEvidenceDto).toList())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void recalculate(DevelopmentPlan entity) {
        if (entity.getCompetencies() != null) {
            entity.getCompetencies().forEach(this::calculateGap);
        }
        if (entity.getGoals() != null) {
            entity.getGoals().forEach(this::calculateGoalProgress);
        }
        entity.setProgress(calculatePlanProgress(entity));
        entity.setLastCheckinAt(calculateLastCheckin(entity));
        if (isOverdue(entity) && entity.getPlanStatus() != DevelopmentPlanStatusEnum.COMPLETED
                && entity.getPlanStatus() != DevelopmentPlanStatusEnum.CANCELED) {
            entity.setPlanStatus(DevelopmentPlanStatusEnum.OVERDUE);
        }
    }

    public boolean isOverdue(DevelopmentPlan entity) {
        return entity.getEndDate() != null
                && entity.getEndDate().isBefore(LocalDate.now())
                && normalized(entity.getProgress()) < 100
                && entity.getPlanStatus() != DevelopmentPlanStatusEnum.COMPLETED
                && entity.getPlanStatus() != DevelopmentPlanStatusEnum.CANCELED;
    }

    public boolean isMissingRecentCheckin(DevelopmentPlan entity) {
        if (entity.getPlanStatus() != DevelopmentPlanStatusEnum.IN_PROGRESS) {
            return false;
        }
        int days = frequencyDays(entity);
        if (days <= 0) {
            return false;
        }
        LocalDate last = entity.getLastCheckinAt();
        LocalDate reference = last != null ? last : entity.getStartDate();
        return reference != null && reference.plusDays(days).isBefore(LocalDate.now());
    }

    private void applyScalarFields(DevelopmentPlan entity, DevelopmentPlanRequestDto dto, boolean creating) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setJobPositionName(dto.getJobPositionName());
        entity.setDepartmentId(dto.getDepartmentId());
        entity.setDepartmentName(dto.getDepartmentName());
        entity.setTargetJobPositionId(dto.getTargetJobPositionId());
        entity.setTargetJobPositionName(dto.getTargetJobPositionName());
        entity.setManagerId(dto.getManagerId());
        entity.setManagerName(dto.getManagerName());
        entity.setTrackId(dto.getTrackId());
        entity.setTrackName(dto.getTrackName());
        entity.setOriginId(dto.getOriginId());
        entity.setOriginName(dto.getOriginName());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setCheckinFrequency(dto.getCheckinFrequency());
        entity.setCheckinFrequencyDays(dto.getCheckinFrequencyDays());
        entity.setNotes(dto.getNotes());
        if (creating) {
            entity.setPlanStatus(DevelopmentPlanStatusEnum.DRAFT);
        } else if (dto.getPlanStatus() != null) {
            entity.setPlanStatus(dto.getPlanStatus());
        }
    }

    private DevelopmentPlanCompetencyItemDto toCompetencyDto(DevelopmentPlanCompetency child) {
        return DevelopmentPlanCompetencyItemDto.builder()
                .id(child.getId())
                .competencyId(child.getCompetencyId())
                .competencyName(child.getCompetencyName())
                .currentLevelId(child.getCurrentLevelId())
                .currentLevelOrder(child.getCurrentLevelOrder())
                .expectedLevelId(child.getExpectedLevelId())
                .expectedLevelOrder(child.getExpectedLevelOrder())
                .gap(child.getGap())
                .priority(child.getPriority())
                .notes(child.getNotes())
                .build();
    }

    private DevelopmentPlanGoalItemDto toGoalDto(DevelopmentPlanGoal child) {
        return DevelopmentPlanGoalItemDto.builder()
                .id(child.getId())
                .title(child.getTitle())
                .description(child.getDescription())
                .competencyId(child.getCompetencyId())
                .competencyName(child.getCompetencyName())
                .type(child.getType())
                .expectedResult(child.getExpectedResult())
                .successIndicator(child.getSuccessIndicator())
                .deadline(child.getDeadline())
                .weight(child.getWeight())
                .status(child.getStatus())
                .progress(child.getProgress())
                .actions(child.getActions().stream().map(this::toActionDto).toList())
                .build();
    }

    private DevelopmentPlanActionItemDto toActionDto(DevelopmentPlanAction child) {
        return DevelopmentPlanActionItemDto.builder()
                .id(child.getId())
                .title(child.getTitle())
                .description(child.getDescription())
                .actionType(child.getActionType())
                .assignee(child.getAssignee())
                .startDate(child.getStartDate())
                .endDate(child.getEndDate())
                .workloadHours(child.getWorkloadHours())
                .estimatedCost(child.getEstimatedCost())
                .evidenceRequired(child.getEvidenceRequired())
                .status(child.getStatus())
                .progress(child.getProgress())
                .notes(child.getNotes())
                .build();
    }

    private DevelopmentPlanCheckinItemDto toCheckinDto(DevelopmentPlanCheckin child) {
        return DevelopmentPlanCheckinItemDto.builder()
                .id(child.getId())
                .date(child.getDate())
                .participants(child.getParticipants())
                .summary(child.getSummary())
                .perceivedProgress(child.getPerceivedProgress())
                .blockers(child.getBlockers())
                .nextSteps(child.getNextSteps())
                .collaboratorRating(child.getCollaboratorRating())
                .managerRating(child.getManagerRating())
                .build();
    }

    private DevelopmentPlanEvidenceItemDto toEvidenceDto(DevelopmentPlanEvidence child) {
        return DevelopmentPlanEvidenceItemDto.builder()
                .id(child.getId())
                .evidenceTypeId(child.getEvidenceTypeId())
                .evidenceTypeName(child.getEvidenceTypeName())
                .description(child.getDescription())
                .file(child.getFile())
                .link(child.getLink())
                .goalId(child.getGoalId())
                .actionId(child.getActionId())
                .date(child.getDate())
                .responsibleUserId(child.getResponsibleUserId())
                .responsibleUserName(child.getResponsibleUserName())
                .build();
    }

    private void reconcileCompetencies(DevelopmentPlan entity, List<DevelopmentPlanCompetencyItemDto> items) {
        Map<UUID, DevelopmentPlanCompetency> byId = entity.getCompetencies().stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(DevelopmentPlanCompetency::getId, Function.identity()));
        List<DevelopmentPlanCompetency> result = new ArrayList<>();
        if (items != null) {
            for (DevelopmentPlanCompetencyItemDto item : items) {
                DevelopmentPlanCompetency child = item.getId() != null ? byId.get(item.getId()) : null;
                if (child == null) child = new DevelopmentPlanCompetency();
                child.setPlan(entity);
                child.setCompetencyId(item.getCompetencyId());
                child.setCompetencyName(item.getCompetencyName());
                child.setCurrentLevelId(item.getCurrentLevelId());
                child.setCurrentLevelOrder(item.getCurrentLevelOrder());
                child.setExpectedLevelId(item.getExpectedLevelId());
                child.setExpectedLevelOrder(item.getExpectedLevelOrder());
                child.setNotes(item.getNotes());
                calculateGap(child);
                result.add(child);
            }
        }
        entity.getCompetencies().clear();
        entity.getCompetencies().addAll(result);
    }

    private void reconcileGoals(DevelopmentPlan entity, List<DevelopmentPlanGoalItemDto> items) {
        Map<UUID, DevelopmentPlanGoal> byId = entity.getGoals().stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(DevelopmentPlanGoal::getId, Function.identity()));
        List<DevelopmentPlanGoal> result = new ArrayList<>();
        if (items != null) {
            for (DevelopmentPlanGoalItemDto item : items) {
                DevelopmentPlanGoal child = item.getId() != null ? byId.get(item.getId()) : null;
                if (child == null) child = new DevelopmentPlanGoal();
                child.setPlan(entity);
                child.setTitle(item.getTitle());
                child.setDescription(item.getDescription());
                child.setCompetencyId(item.getCompetencyId());
                child.setCompetencyName(item.getCompetencyName());
                child.setType(item.getType());
                child.setExpectedResult(item.getExpectedResult());
                child.setSuccessIndicator(item.getSuccessIndicator());
                child.setDeadline(item.getDeadline());
                child.setWeight(item.getWeight());
                child.setStatus(item.getStatus() != null ? item.getStatus() : DevelopmentActionStatusEnum.NOT_STARTED);
                reconcileActions(child, item.getActions());
                calculateGoalProgress(child);
                result.add(child);
            }
        }
        entity.getGoals().clear();
        entity.getGoals().addAll(result);
    }

    private void reconcileActions(DevelopmentPlanGoal goal, List<DevelopmentPlanActionItemDto> items) {
        Map<UUID, DevelopmentPlanAction> byId = goal.getActions().stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(DevelopmentPlanAction::getId, Function.identity()));
        List<DevelopmentPlanAction> result = new ArrayList<>();
        if (items != null) {
            for (DevelopmentPlanActionItemDto item : items) {
                DevelopmentPlanAction child = item.getId() != null ? byId.get(item.getId()) : null;
                if (child == null) child = new DevelopmentPlanAction();
                child.setGoal(goal);
                child.setTitle(item.getTitle());
                child.setDescription(item.getDescription());
                child.setActionType(item.getActionType());
                child.setAssignee(item.getAssignee());
                child.setStartDate(item.getStartDate());
                child.setEndDate(item.getEndDate());
                child.setWorkloadHours(item.getWorkloadHours());
                child.setEstimatedCost(item.getEstimatedCost());
                child.setEvidenceRequired(item.getEvidenceRequired() != null && item.getEvidenceRequired());
                child.setStatus(resolveActionStatus(item));
                child.setProgress(clamp(item.getProgress()));
                child.setNotes(item.getNotes());
                result.add(child);
            }
        }
        goal.getActions().clear();
        goal.getActions().addAll(result);
    }

    private void reconcileCheckins(DevelopmentPlan entity, List<DevelopmentPlanCheckinItemDto> items) {
        Map<UUID, DevelopmentPlanCheckin> byId = entity.getCheckins().stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(DevelopmentPlanCheckin::getId, Function.identity()));
        List<DevelopmentPlanCheckin> result = new ArrayList<>();
        if (items != null) {
            for (DevelopmentPlanCheckinItemDto item : items) {
                DevelopmentPlanCheckin child = item.getId() != null ? byId.get(item.getId()) : null;
                if (child == null) child = new DevelopmentPlanCheckin();
                child.setPlan(entity);
                child.setDate(item.getDate());
                child.setParticipants(item.getParticipants());
                child.setSummary(item.getSummary());
                child.setPerceivedProgress(item.getPerceivedProgress());
                child.setBlockers(item.getBlockers());
                child.setNextSteps(item.getNextSteps());
                child.setCollaboratorRating(item.getCollaboratorRating());
                child.setManagerRating(item.getManagerRating());
                result.add(child);
            }
        }
        entity.getCheckins().clear();
        entity.getCheckins().addAll(result);
    }

    private void reconcileEvidences(DevelopmentPlan entity, List<DevelopmentPlanEvidenceItemDto> items) {
        Map<UUID, DevelopmentPlanEvidence> byId = entity.getEvidences().stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(DevelopmentPlanEvidence::getId, Function.identity()));
        List<DevelopmentPlanEvidence> result = new ArrayList<>();
        if (items != null) {
            for (DevelopmentPlanEvidenceItemDto item : items) {
                DevelopmentPlanEvidence child = item.getId() != null ? byId.get(item.getId()) : null;
                if (child == null) child = new DevelopmentPlanEvidence();
                child.setPlan(entity);
                child.setEvidenceTypeId(item.getEvidenceTypeId());
                child.setEvidenceTypeName(item.getEvidenceTypeName());
                child.setDescription(item.getDescription());
                child.setFile(item.getFile());
                child.setLink(item.getLink());
                child.setGoalId(item.getGoalId());
                child.setActionId(item.getActionId());
                child.setDate(item.getDate());
                child.setResponsibleUserId(item.getResponsibleUserId());
                child.setResponsibleUserName(item.getResponsibleUserName());
                result.add(child);
            }
        }
        entity.getEvidences().clear();
        entity.getEvidences().addAll(result);
    }

    private void calculateGap(DevelopmentPlanCompetency child) {
        int expected = child.getExpectedLevelOrder() != null ? child.getExpectedLevelOrder() : 0;
        int current = child.getCurrentLevelOrder() != null ? child.getCurrentLevelOrder() : 0;
        int gap = expected - current;
        child.setGap(gap);
        if (gap >= 3) child.setPriority(GapPriorityEnum.CRITICAL);
        else if (gap == 2) child.setPriority(GapPriorityEnum.HIGH);
        else if (gap == 1) child.setPriority(GapPriorityEnum.MEDIUM);
        else child.setPriority(GapPriorityEnum.NONE);
    }

    private void calculateGoalProgress(DevelopmentPlanGoal goal) {
        if (goal.getActions() == null || goal.getActions().isEmpty()) {
            goal.setProgress(clamp(goal.getProgress()));
            return;
        }
        int progress = (int) Math.round(goal.getActions().stream()
                .mapToInt(action -> normalized(action.getProgress()))
                .average()
                .orElse(0));
        goal.setProgress(progress);
        if (progress >= 100) goal.setStatus(DevelopmentActionStatusEnum.COMPLETED);
        else if (goal.getStatus() == null || goal.getStatus() == DevelopmentActionStatusEnum.COMPLETED) {
            goal.setStatus(progress > 0 ? DevelopmentActionStatusEnum.IN_PROGRESS : DevelopmentActionStatusEnum.NOT_STARTED);
        }
    }

    private Integer calculatePlanProgress(DevelopmentPlan entity) {
        if (entity.getGoals() == null || entity.getGoals().isEmpty()) {
            return 0;
        }
        int totalWeight = entity.getGoals().stream().mapToInt(goal -> Math.max(0, normalized(goal.getWeight()))).sum();
        if (totalWeight <= 0) {
            return (int) Math.round(entity.getGoals().stream().mapToInt(goal -> normalized(goal.getProgress())).average().orElse(0));
        }
        int weighted = entity.getGoals().stream()
                .mapToInt(goal -> normalized(goal.getProgress()) * Math.max(0, normalized(goal.getWeight())))
                .sum();
        return (int) Math.round((double) weighted / totalWeight);
    }

    private LocalDate calculateLastCheckin(DevelopmentPlan entity) {
        if (entity.getCheckins() == null) {
            return null;
        }
        return entity.getCheckins().stream()
                .map(DevelopmentPlanCheckin::getDate)
                .filter(date -> date != null)
                .max(LocalDate::compareTo)
                .orElse(null);
    }

    private DevelopmentActionStatusEnum resolveActionStatus(DevelopmentPlanActionItemDto item) {
        Integer progress = item.getProgress();
        if (progress != null && progress >= 100) return DevelopmentActionStatusEnum.COMPLETED;
        if (item.getEndDate() != null && item.getEndDate().isBefore(LocalDate.now()) && normalized(progress) < 100) {
            return DevelopmentActionStatusEnum.OVERDUE;
        }
        if (item.getStatus() != null) return item.getStatus();
        return normalized(progress) > 0 ? DevelopmentActionStatusEnum.IN_PROGRESS : DevelopmentActionStatusEnum.NOT_STARTED;
    }

    private int frequencyDays(DevelopmentPlan entity) {
        if (entity.getCheckinFrequency() == CheckinFrequencyEnum.WEEKLY) return 7;
        if (entity.getCheckinFrequency() == CheckinFrequencyEnum.BIWEEKLY) return 15;
        if (entity.getCheckinFrequency() == CheckinFrequencyEnum.MONTHLY) return 30;
        if (entity.getCheckinFrequency() == CheckinFrequencyEnum.CUSTOM) return normalized(entity.getCheckinFrequencyDays());
        return 0;
    }

    private Integer clamp(Integer value) {
        return Math.max(0, Math.min(100, normalized(value)));
    }

    private int normalized(Integer value) {
        return value != null ? value : 0;
    }
}