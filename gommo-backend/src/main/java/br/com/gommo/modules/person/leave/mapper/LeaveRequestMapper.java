package br.com.gommo.modules.person.leave.mapper;
import br.com.gommo.modules.person.leave.dto.*; import br.com.gommo.modules.person.leave.entity.LeaveRequest; import br.com.gommo.modules.person.leave.entity.LeaveTypeEnum;
import org.springframework.stereotype.Component;
@Component public class LeaveRequestMapper {
    public LeaveRequest toEntity(LeaveRequestRequestDto dto) {
        return LeaveRequest.builder().collaboratorId(dto.getCollaboratorId())
            .leaveType(dto.getLeaveType() != null ? dto.getLeaveType() : LeaveTypeEnum.VACATION)
            .startDate(dto.getStartDate()).endDate(dto.getEndDate())
            .approved(dto.getApproved() != null ? dto.getApproved() : Boolean.FALSE).notes(dto.getNotes()).build();
    }
    public void updateEntity(LeaveRequest entity, LeaveRequestRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        if (dto.getLeaveType() != null) entity.setLeaveType(dto.getLeaveType());
        entity.setStartDate(dto.getStartDate()); entity.setEndDate(dto.getEndDate());
        if (dto.getApproved() != null) entity.setApproved(dto.getApproved());
        entity.setNotes(dto.getNotes());
    }
    public LeaveRequestResponseDto toResponse(LeaveRequest entity) {
        return LeaveRequestResponseDto.builder().id(entity.getId()).status(entity.getStatus())
            .collaboratorId(entity.getCollaboratorId()).leaveType(entity.getLeaveType())
            .startDate(entity.getStartDate()).endDate(entity.getEndDate()).approved(entity.getApproved()).notes(entity.getNotes())
            .createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt()).build();
    }
}
