package br.com.gommo.modules.rh.person.leave.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.rh.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.VacationReviewStatusEnum;

@Component
public class LeaveRequestMapper {
    public LeaveRequest toEntity(LeaveRequestRequestDto dto) {
        return LeaveRequest.builder()
                .collaboratorId(dto.getCollaboratorId())
                .leaveType(dto.getLeaveType() != null ? dto.getLeaveType() : LeaveTypeEnum.VACATION)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
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
                .build();
    }

    public void updateEntity(LeaveRequest entity, LeaveRequestRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getLeaveType() != null) {
            entity.setLeaveType(dto.getLeaveType());
        }
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
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
    }

    public LeaveRequestResponseDto toResponse(LeaveRequest entity) {
        return toResponse(entity, null);
    }

    public LeaveRequestResponseDto toResponse(LeaveRequest entity, String collaboratorName) {
        return LeaveRequestResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorName(collaboratorName)
                .leaveType(entity.getLeaveType())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
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
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static int defaultPecuniary(Integer value) {
        return value != null ? value : 0;
    }
}
