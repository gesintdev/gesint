package br.com.gommo.modules.rh.person.leave.mapper;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.leave.domain.VacationRules;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;

@Component
public class LeaveRequestMapper {
    public LeaveRequest toEntity(LeaveRequestRequestDto dto) {
        return LeaveRequest.builder()
                .status(StatusEnum.ACTIVE)
                .collaboratorId(dto.getCollaboratorId())
                .leaveType(dto.getLeaveType() != null ? dto.getLeaveType() : LeaveTypeEnum.VACATION)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .absenceStatus(dto.getAbsenceStatus())
                .durationDays(dto.getDurationDays())
                .cid(normalizeCid(dto.getCid()))
                .physicianName(blankToNull(dto.getPhysicianName()))
                .physicianCrm(blankToNull(dto.getPhysicianCrm()))
                .certificateSource(blankToNull(dto.getCertificateSource()))
                .requiresInss(dto.getRequiresInss() != null ? dto.getRequiresInss() : Boolean.FALSE)
                .inssReferralDate(dto.getInssReferralDate())
                .returnDate(dto.getReturnDate())
                .workAccidentStability(
                        dto.getWorkAccidentStability() != null ? dto.getWorkAccidentStability() : Boolean.FALSE)
                .relatedCertificateDays(dto.getRelatedCertificateDays())
                .approved(dto.getApproved() != null ? dto.getApproved() : Boolean.FALSE)
                .notes(dto.getNotes())
                .pecuniaryAllowanceDays(defaultPecuniary(dto.getPecuniaryAllowanceDays()))
                .unjustifiedAbsences(dto.getUnjustifiedAbsences())
                .vacationDaysEntitled(dto.getVacationDaysEntitled())
                .acquisitionPeriodStart(dto.getAcquisitionPeriodStart())
                .acquisitionPeriodEnd(dto.getAcquisitionPeriodEnd())
                .splitGroupId(dto.getSplitGroupId())
                .splitSequence(dto.getSplitSequence())
                .baseSalarySnapshot(dto.getBaseSalarySnapshot())
                .justifiedAbsences(dto.getJustifiedAbsences())
                .reviewStatus(dto.getReviewStatus())
                .reviewReason(dto.getReviewReason())
                .recessPeriodId(dto.getRecessPeriodId())
                .recessFinancialMode(dto.getRecessFinancialMode())
                .recessPaidPercentage(dto.getRecessPaidPercentage())
                .build();
    }

    public void updateEntity(LeaveRequest entity, LeaveRequestRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getLeaveType() != null) {
            entity.setLeaveType(dto.getLeaveType());
        }
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setAbsenceStatus(dto.getAbsenceStatus());
        entity.setDurationDays(dto.getDurationDays());
        entity.setCid(normalizeCid(dto.getCid()));
        entity.setPhysicianName(blankToNull(dto.getPhysicianName()));
        entity.setPhysicianCrm(blankToNull(dto.getPhysicianCrm()));
        entity.setCertificateSource(blankToNull(dto.getCertificateSource()));
        entity.setRequiresInss(dto.getRequiresInss() != null ? dto.getRequiresInss() : Boolean.FALSE);
        entity.setInssReferralDate(dto.getInssReferralDate());
        entity.setReturnDate(dto.getReturnDate());
        entity.setWorkAccidentStability(
                dto.getWorkAccidentStability() != null ? dto.getWorkAccidentStability() : Boolean.FALSE);
        entity.setRelatedCertificateDays(dto.getRelatedCertificateDays());
        if (dto.getApproved() != null) {
            entity.setApproved(dto.getApproved());
        }
        entity.setNotes(dto.getNotes());
        if (dto.getPecuniaryAllowanceDays() != null) {
            entity.setPecuniaryAllowanceDays(dto.getPecuniaryAllowanceDays());
        }
        entity.setUnjustifiedAbsences(dto.getUnjustifiedAbsences());
        entity.setVacationDaysEntitled(dto.getVacationDaysEntitled());
        entity.setAcquisitionPeriodStart(dto.getAcquisitionPeriodStart());
        entity.setAcquisitionPeriodEnd(dto.getAcquisitionPeriodEnd());
        entity.setSplitGroupId(dto.getSplitGroupId());
        entity.setSplitSequence(dto.getSplitSequence());
        entity.setBaseSalarySnapshot(dto.getBaseSalarySnapshot());
        entity.setJustifiedAbsences(dto.getJustifiedAbsences());
        if (dto.getReviewStatus() != null) {
            entity.setReviewStatus(dto.getReviewStatus());
        }
        entity.setReviewReason(dto.getReviewReason());
        entity.setRecessPeriodId(dto.getRecessPeriodId());
        entity.setRecessFinancialMode(dto.getRecessFinancialMode());
        entity.setRecessPaidPercentage(dto.getRecessPaidPercentage());
    }

    public LeaveRequestResponseDto toResponse(LeaveRequest entity) {
        return toResponse(entity, null, null, null);
    }

    public LeaveRequestResponseDto toResponse(LeaveRequest entity, String collaboratorName) {
        return toResponse(entity, collaboratorName, null, null);
    }

    public LeaveRequestResponseDto toResponse(
            LeaveRequest entity, String collaboratorName, String reviewedByName, String createdByName) {
        LocalDate concessiveStart = null;
        LocalDate concessiveEnd = null;
        if (entity.getAcquisitionPeriodEnd() != null) {
            VacationRules.DateRange concessive = VacationRules.concessivePeriod(entity.getAcquisitionPeriodEnd());
            concessiveStart = concessive.start();
            concessiveEnd = concessive.end();
        }
        return LeaveRequestResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorName(collaboratorName)
                .leaveType(entity.getLeaveType())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .absenceStatus(entity.getAbsenceStatus())
                .durationDays(entity.getDurationDays())
                .cid(entity.getCid())
                .physicianName(entity.getPhysicianName())
                .physicianCrm(entity.getPhysicianCrm())
                .certificateSource(entity.getCertificateSource())
                .requiresInss(entity.getRequiresInss())
                .inssReferralDate(entity.getInssReferralDate())
                .returnDate(entity.getReturnDate())
                .workAccidentStability(entity.getWorkAccidentStability())
                .relatedCertificateDays(entity.getRelatedCertificateDays())
                .hasRelatedCidPeriods(entity.getRelatedCertificateDays() != null
                        && entity.getRelatedCertificateDays() > defaultDuration(entity))
                .approved(entity.getApproved())
                .notes(entity.getNotes())
                .pecuniaryAllowanceDays(entity.getPecuniaryAllowanceDays())
                .unjustifiedAbsences(entity.getUnjustifiedAbsences())
                .vacationDaysEntitled(entity.getVacationDaysEntitled())
                .acquisitionPeriodStart(entity.getAcquisitionPeriodStart())
                .acquisitionPeriodEnd(entity.getAcquisitionPeriodEnd())
                .splitGroupId(entity.getSplitGroupId())
                .splitSequence(entity.getSplitSequence())
                .baseSalarySnapshot(entity.getBaseSalarySnapshot())
                .justifiedAbsences(entity.getJustifiedAbsences())
                .reviewStatus(entity.getReviewStatus())
                .reviewReason(entity.getReviewReason())
                .reviewedAt(entity.getReviewedAt())
                .reviewedBy(entity.getReviewedBy())
                .reviewedByName(reviewedByName)
                .concessivePeriodStart(concessiveStart)
                .concessivePeriodEnd(concessiveEnd)
                .recessPeriodId(entity.getRecessPeriodId())
                .recessFinancialMode(entity.getRecessFinancialMode())
                .recessPaidPercentage(entity.getRecessPaidPercentage())
                .createdBy(entity.getCreatedBy())
                .createdByName(createdByName)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static int defaultPecuniary(Integer value) {
        return value != null ? value : 0;
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

    private static int defaultDuration(LeaveRequest entity) {
        return entity.getDurationDays() != null ? entity.getDurationDays() : 0;
    }
}
