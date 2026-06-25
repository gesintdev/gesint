package br.com.gommo.modules.rh.person.attendance.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.attendance.dto.*;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRecord;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;

@Component
public class AttendanceRecordMapper {
    public AttendanceRecord toEntity(AttendanceRecordRequestDto dto) {
        return AttendanceRecord.builder()
                .collaboratorId(dto.getCollaboratorId())
                .workDate(dto.getWorkDate())
                .clockIn(dto.getClockIn())
                .clockOut(dto.getClockOut())
                .breakMinutes(dto.getBreakMinutes())
                .occurrenceType(dto.getOccurrenceType() != null ? dto.getOccurrenceType() : AttendanceOccurrenceTypeEnum.NORMAL_WORK)
                .occurrenceOrigin(dto.getOccurrenceOrigin() != null ? dto.getOccurrenceOrigin() : AttendanceOccurrenceOriginEnum.MANUAL)
                .referenceId(dto.getReferenceId())
                .expectedHours(dto.getExpectedHours())
                .workedHours(dto.getWorkedHours())
                .impactsHourBank(dto.getImpactsHourBank() != null ? dto.getImpactsHourBank() : Boolean.TRUE)
                .impactsPayroll(dto.getImpactsPayroll() != null ? dto.getImpactsPayroll() : Boolean.TRUE)
                .notes(dto.getNotes())
                .build();
    }

    public void updateEntity(AttendanceRecord entity, AttendanceRecordRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setWorkDate(dto.getWorkDate());
        entity.setClockIn(dto.getClockIn());
        entity.setClockOut(dto.getClockOut());
        entity.setBreakMinutes(dto.getBreakMinutes());
        entity.setOccurrenceType(dto.getOccurrenceType() != null ? dto.getOccurrenceType() : AttendanceOccurrenceTypeEnum.NORMAL_WORK);
        entity.setOccurrenceOrigin(dto.getOccurrenceOrigin() != null ? dto.getOccurrenceOrigin() : AttendanceOccurrenceOriginEnum.MANUAL);
        entity.setReferenceId(dto.getReferenceId());
        entity.setExpectedHours(dto.getExpectedHours());
        entity.setWorkedHours(dto.getWorkedHours());
        entity.setImpactsHourBank(dto.getImpactsHourBank() != null ? dto.getImpactsHourBank() : Boolean.TRUE);
        entity.setImpactsPayroll(dto.getImpactsPayroll() != null ? dto.getImpactsPayroll() : Boolean.TRUE);
        entity.setNotes(dto.getNotes());
    }

    public AttendanceRecordResponseDto toResponse(AttendanceRecord entity) {
        return AttendanceRecordResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .collaboratorId(entity.getCollaboratorId())
                .workDate(entity.getWorkDate())
                .clockIn(entity.getClockIn())
                .clockOut(entity.getClockOut())
                .breakMinutes(entity.getBreakMinutes())
                .occurrenceType(entity.getOccurrenceType())
                .occurrenceOrigin(entity.getOccurrenceOrigin())
                .referenceId(entity.getReferenceId())
                .expectedHours(entity.getExpectedHours())
                .workedHours(entity.getWorkedHours())
                .impactsHourBank(entity.getImpactsHourBank())
                .impactsPayroll(entity.getImpactsPayroll())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
