package br.com.gommo.modules.rh.person.occupationalexam.exam.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.complementaryexam.dto.ComplementaryExamResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamClinicalDataDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamRequestDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.dto.OccupationalExamResponseDto;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExam;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.entity.OccupationalExamSourceTriggerEnum;

@Component
public class OccupationalExamMapper {

    public OccupationalExam toEntity(OccupationalExamRequestDto dto) {
        return OccupationalExam.builder()
                .status(StatusEnum.ACTIVE)
                .collaboratorId(dto.getCollaboratorId())
                .jobPositionId(dto.getJobPositionId())
                .examType(dto.getExamType())
                .lifecycleStatus(
                        dto.getLifecycleStatus() != null
                                ? dto.getLifecycleStatus()
                                : OccupationalExamLifecycleStatusEnum.PREVISTO)
                .clinicId(dto.getClinicId())
                .examinerPhysicianId(dto.getExaminerPhysicianId())
                .coordinatorPhysicianId(dto.getCoordinatorPhysicianId())
                .scheduledDate(dto.getScheduledDate())
                .clinicalExamDate(dto.getClinicalExamDate())
                .asoIssueDate(dto.getAsoIssueDate())
                .dueDate(dto.getDueDate())
                .result(dto.getResult())
                .cid(normalizeCid(dto.getCid()))
                .clinicalObservations(blankToNull(dto.getClinicalObservations()))
                .sourceTrigger(
                        dto.getSourceTrigger() != null
                                ? dto.getSourceTrigger()
                                : OccupationalExamSourceTriggerEnum.MANUAL)
                .relatedLeaveRequestId(dto.getRelatedLeaveRequestId())
                .examRequirementVersionId(dto.getExamRequirementVersionId())
                .dismissalWaiverApplied(
                        dto.getDismissalWaiverApplied() != null ? dto.getDismissalWaiverApplied() : Boolean.FALSE)
                .dismissalWaiverReason(blankToNull(dto.getDismissalWaiverReason()))
                .retentionUntil(dto.getRetentionUntil())
                .build();
    }

    public void updateEntity(OccupationalExam entity, OccupationalExamRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setExamType(dto.getExamType());
        if (dto.getLifecycleStatus() != null) {
            entity.setLifecycleStatus(dto.getLifecycleStatus());
        }
        entity.setClinicId(dto.getClinicId());
        entity.setExaminerPhysicianId(dto.getExaminerPhysicianId());
        entity.setCoordinatorPhysicianId(dto.getCoordinatorPhysicianId());
        entity.setScheduledDate(dto.getScheduledDate());
        entity.setClinicalExamDate(dto.getClinicalExamDate());
        entity.setAsoIssueDate(dto.getAsoIssueDate());
        entity.setResult(dto.getResult());
        entity.setCid(normalizeCid(dto.getCid()));
        entity.setClinicalObservations(blankToNull(dto.getClinicalObservations()));
        if (dto.getSourceTrigger() != null) {
            entity.setSourceTrigger(dto.getSourceTrigger());
        }
        entity.setRelatedLeaveRequestId(dto.getRelatedLeaveRequestId());
        entity.setExamRequirementVersionId(dto.getExamRequirementVersionId());
        if (dto.getDismissalWaiverApplied() != null) {
            entity.setDismissalWaiverApplied(dto.getDismissalWaiverApplied());
        }
        entity.setDismissalWaiverReason(blankToNull(dto.getDismissalWaiverReason()));
        entity.setRetentionUntil(dto.getRetentionUntil());
    }

    /**
     * Monta a resposta operacional. Dados clinicos so entram quando
     * {@code includeClinical} for true (decisao do service via RBAC).
     */
    public OccupationalExamResponseDto toResponse(
            OccupationalExam entity, boolean includeClinical, List<ComplementaryExamResponseDto> complementaryExams) {
        OccupationalExamClinicalDataDto clinicalData = null;
        if (includeClinical) {
            clinicalData = OccupationalExamClinicalDataDto.builder()
                    .cid(entity.getCid())
                    .clinicalObservations(entity.getClinicalObservations())
                    .complementaryExams(complementaryExams)
                    .build();
        }
        return OccupationalExamResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .jobPositionId(entity.getJobPositionId())
                .examType(entity.getExamType())
                .lifecycleStatus(entity.getLifecycleStatus())
                .clinicId(entity.getClinicId())
                .examinerPhysicianId(entity.getExaminerPhysicianId())
                .coordinatorPhysicianId(entity.getCoordinatorPhysicianId())
                .scheduledDate(entity.getScheduledDate())
                .clinicalExamDate(entity.getClinicalExamDate())
                .asoIssueDate(entity.getAsoIssueDate())
                .dueDate(entity.getDueDate())
                .result(entity.getResult())
                .sourceTrigger(entity.getSourceTrigger())
                .relatedLeaveRequestId(entity.getRelatedLeaveRequestId())
                .examRequirementVersionId(entity.getExamRequirementVersionId())
                .dismissalWaiverApplied(entity.getDismissalWaiverApplied())
                .dismissalWaiverReason(entity.getDismissalWaiverReason())
                .retentionUntil(entity.getRetentionUntil())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .clinicalData(clinicalData)
                .build();
    }

    public OccupationalExamResponseDto toResponse(OccupationalExam entity) {
        return toResponse(entity, false, List.of());
    }

    private static String normalizeCid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
