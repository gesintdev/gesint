package br.com.gesint.modules.rh.person.experience.mapper;

import java.util.ArrayList;

import org.springframework.stereotype.Component;

import br.com.gesint.modules.rh.person.experience.dto.ExperienceEvaluationRequestDto;
import br.com.gesint.modules.rh.person.experience.dto.ExperienceEvaluationResponseDto;
import br.com.gesint.modules.rh.person.experience.entity.ExperienceEvaluation;
import br.com.gesint.modules.rh.person.experience.entity.ExperiencePeriodEnum;
import br.com.gesint.modules.rh.person.experience.entity.ExperiencePeriodStatusEnum;
import br.com.gesint.modules.rh.person.experience.service.ExperiencePeriodCalculator;

@Component
public class ExperienceEvaluationMapper {

    public ExperienceEvaluation toEntity(ExperienceEvaluationRequestDto dto) {
        ExperiencePeriodEnum period =
                dto.getExperiencePeriod() == null ? ExperiencePeriodEnum.NONE : dto.getExperiencePeriod();
        return ExperienceEvaluation.builder()
                .admissionProcessId(dto.getAdmissionProcessId())
                .collaboratorId(dto.getCollaboratorId())
                .experiencePeriod(period)
                .build();
    }

    public ExperienceEvaluationResponseDto toResponse(ExperienceEvaluation entity) {
        boolean decided = entity.getPeriodStatus() == ExperiencePeriodStatusEnum.EFFECTIVE
                || entity.getPeriodStatus() == ExperiencePeriodStatusEnum.ENDED
                || entity.getDecision() != null
                        && entity.getDecision()
                                != br.com.gesint.modules.rh.person.experience.entity.ExperienceDecisionEnum.EXTEND;
        return ExperienceEvaluationResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .companyId(entity.getCompanyId())
                .collaboratorId(entity.getCollaboratorId())
                .admissionProcessId(entity.getAdmissionProcessId())
                .jobPositionId(entity.getJobPositionId())
                .collaboratorName(entity.getCollaboratorName())
                .jobPositionName(entity.getJobPositionName())
                .admissionDate(entity.getAdmissionDate())
                .experiencePeriod(entity.getExperiencePeriod())
                .experienceExtensionUsed(entity.isExperienceExtensionUsed())
                .experienceMilestoneDays(entity.getExperienceMilestoneDays())
                .experienceDueDate(entity.getExperienceDueDate())
                .periodStatus(entity.getPeriodStatus())
                .evaluationStatus(entity.getEvaluationStatus())
                .evaluatorUserId(entity.getEvaluatorUserId())
                .evaluatorName(entity.getEvaluatorName())
                .submittedAt(entity.getSubmittedAt())
                .averageScore(entity.getAverageScore())
                .selectionAverage(entity.getSelectionAverage())
                .decision(entity.getDecision())
                .decisionReason(entity.getDecisionReason())
                .decisionNotes(entity.getDecisionNotes())
                .decidedBy(entity.getDecidedBy())
                .decidedByName(entity.getDecidedByName())
                .decidedAt(entity.getDecidedAt())
                .offboardingId(entity.getOffboardingId())
                .canExtend(ExperiencePeriodCalculator.canExtend(
                        entity.getExperiencePeriod(), entity.isExperienceExtensionUsed()))
                .decided(decided
                        && entity.getPeriodStatus() != ExperiencePeriodStatusEnum.IN_PERIOD
                        && entity.getPeriodStatus() != ExperiencePeriodStatusEnum.PENDING_DECISION
                        && entity.getPeriodStatus() != ExperiencePeriodStatusEnum.EXTENDED)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .competencies(new ArrayList<>())
                .scores(new ArrayList<>())
                .build();
    }
}
