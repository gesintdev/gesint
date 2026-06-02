package br.com.gommo.modules.person.leave.mapper;

import br.com.gommo.modules.person.leave.dto.LeaveRequestRequestDto;
import br.com.gommo.modules.person.leave.dto.LeaveRequestResponseDto;
import br.com.gommo.modules.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;
import org.springframework.stereotype.Component;

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
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private static int defaultPecuniary(Integer value) {
        return value != null ? value : 0;
    }
}
