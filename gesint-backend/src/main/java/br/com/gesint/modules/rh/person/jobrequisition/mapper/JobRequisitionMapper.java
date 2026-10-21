package br.com.gesint.modules.rh.person.jobrequisition.mapper;

import org.springframework.stereotype.Component;

import br.com.gesint.modules.rh.person.jobrequisition.dto.JobRequisitionRequestDto;
import br.com.gesint.modules.rh.person.jobrequisition.dto.JobRequisitionResponseDto;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisition;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionReasonEnum;
import br.com.gesint.modules.rh.person.jobrequisition.entity.JobRequisitionStatusEnum;

@Component
public class JobRequisitionMapper {
    public JobRequisition toEntity(JobRequisitionRequestDto dto) {
        JobRequisition entity = JobRequisition.builder()
                .requisitionStatus(JobRequisitionStatusEnum.DRAFT)
                .build();
        updateEntity(entity, dto);
        return entity;
    }

    public void updateEntity(JobRequisition entity, JobRequisitionRequestDto dto) {
        entity.setJobPositionId(dto.getJobPositionId());
        entity.setSalaryLevel(dto.getSalaryLevel());
        entity.setContractType(dto.getContractType());
        entity.setExperiencePeriod(dto.getExperiencePeriod());
        entity.setPositionsCount(dto.getPositionsCount());
        entity.setDesiredStartDate(dto.getDesiredStartDate());
        entity.setReason(dto.getReason());
        entity.setOffboardingId(dto.getReason() == JobRequisitionReasonEnum.REPLACEMENT ? dto.getOffboardingId() : null);
        entity.setProposedSalary(dto.getProposedSalary());
        entity.setJustification(trimToNull(dto.getJustification()));
    }

    public JobRequisitionResponseDto toResponse(JobRequisition entity) {
        return JobRequisitionResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .companyId(entity.getCompanyId())
                .jobPositionId(entity.getJobPositionId())
                .jobPositionTitle(entity.getJobPositionTitle())
                .salaryLevel(entity.getSalaryLevel())
                .contractType(entity.getContractType())
                .experiencePeriod(entity.getExperiencePeriod())
                .positionsCount(entity.getPositionsCount())
                .desiredStartDate(entity.getDesiredStartDate())
                .reason(entity.getReason())
                .offboardingId(entity.getOffboardingId())
                .replacedCollaboratorId(entity.getReplacedCollaboratorId())
                .replacedCollaboratorName(entity.getReplacedCollaboratorName())
                .replacedDismissalDate(entity.getReplacedDismissalDate())
                .replacedDismissalType(entity.getReplacedDismissalType())
                .proposedSalary(entity.getProposedSalary())
                .bandMinSalary(entity.getBandMinSalary())
                .bandReferenceSalary(entity.getBandReferenceSalary())
                .bandMaxSalary(entity.getBandMaxSalary())
                .outOfBand(Boolean.TRUE.equals(entity.getOutOfBand()))
                .justification(entity.getJustification())
                .requisitionStatus(entity.getRequisitionStatus())
                .submittedAt(entity.getSubmittedAt())
                .managerApprovedByName(entity.getManagerApprovedByName())
                .managerApprovedAt(entity.getManagerApprovedAt())
                .hrApprovedByName(entity.getHrApprovedByName())
                .hrApprovedAt(entity.getHrApprovedAt())
                .directorApprovedByName(entity.getDirectorApprovedByName())
                .directorApprovedAt(entity.getDirectorApprovedAt())
                .rejectedByName(entity.getRejectedByName())
                .rejectedAt(entity.getRejectedAt())
                .rejectedStage(entity.getRejectedStage())
                .rejectionReason(entity.getRejectionReason())
                .canceledAt(entity.getCanceledAt())
                .jobVacancyId(entity.getJobVacancyId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
