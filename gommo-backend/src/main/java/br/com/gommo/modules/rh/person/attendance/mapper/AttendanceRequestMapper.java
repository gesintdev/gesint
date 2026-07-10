package br.com.gommo.modules.rh.person.attendance.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.attendance.dto.AttendanceRequestResponseDto;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequest;

@Component
public class AttendanceRequestMapper {

    public AttendanceRequestResponseDto toResponse(AttendanceRequest entity) {
        return toResponse(entity, null);
    }

    public AttendanceRequestResponseDto toResponse(AttendanceRequest entity, String collaboratorName) {
        return AttendanceRequestResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .collaboratorName(collaboratorName)
                .workDate(entity.getWorkDate())
                .attendanceRecordId(entity.getAttendanceRecordId())
                .originalClockIn(entity.getOriginalClockIn())
                .originalClockOut(entity.getOriginalClockOut())
                .originalBreakStart(entity.getOriginalBreakStart())
                .originalBreakEnd(entity.getOriginalBreakEnd())
                .originalBreakMinutes(entity.getOriginalBreakMinutes())
                .originalNotes(entity.getOriginalNotes())
                .clockIn(entity.getClockIn())
                .clockOut(entity.getClockOut())
                .breakStart(entity.getBreakStart())
                .breakEnd(entity.getBreakEnd())
                .breakMinutes(entity.getBreakMinutes())
                .expectedHours(entity.getExpectedHours())
                .workedHours(entity.getWorkedHours())
                .notes(entity.getNotes())
                .requestType(entity.getRequestType())
                .source(entity.getSource())
                .clientRequestId(entity.getClientRequestId())
                .submittedAt(entity.getSubmittedAt())
                .requestStatus(entity.getRequestStatus())
                .reviewedAt(entity.getReviewedAt())
                .reviewedBy(entity.getReviewedBy())
                .reviewReason(entity.getReviewReason())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
