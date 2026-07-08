package br.com.gommo.modules.rh.person.attendance.mapper;

import org.springframework.stereotype.Component;

import br.com.gommo.modules.rh.person.attendance.dto.*;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRecord;

@Component
public class AttendanceRecordMapper {
    public AttendanceRecord toEntity(AttendanceRecordRequestDto dto) {
        return AttendanceRecord.builder()
                .collaboratorId(dto.getCollaboratorId())
                .workDate(dto.getWorkDate())
                .clockIn(dto.getClockIn())
                .clockOut(dto.getClockOut())
                .breakStart(dto.getBreakStart())
                .breakEnd(dto.getBreakEnd())
                .breakMinutes(dto.getBreakMinutes())
                .occurrenceType(
                        dto.getOccurrenceType() != null
                                ? dto.getOccurrenceType()
                                : AttendanceOccurrenceTypeEnum.NORMAL_WORK)
                .occurrenceOrigin(
                        dto.getOccurrenceOrigin() != null
                                ? dto.getOccurrenceOrigin()
                                : AttendanceOccurrenceOriginEnum.MANUAL)
                .referenceId(dto.getReferenceId())
                .expectedHours(dto.getExpectedHours())
                .workedHours(dto.getWorkedHours())
                .impactsHourBank(dto.getImpactsHourBank() != null ? dto.getImpactsHourBank() : Boolean.TRUE)
                .impactsPayroll(dto.getImpactsPayroll() != null ? dto.getImpactsPayroll() : Boolean.TRUE)
                .notes(dto.getNotes())
                .requestType(dto.getRequestType())
                .source(dto.getSource())
                .clientRequestId(dto.getClientRequestId())
                .submittedAt(dto.getSubmittedAt())
                .requestStatus(dto.getRequestStatus())
                .reviewedAt(dto.getReviewedAt())
                .reviewedBy(dto.getReviewedBy())
                .reviewReason(dto.getReviewReason())
                .photoObjectId(dto.getPhotoObjectId())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .locationAccuracyMeters(dto.getLocationAccuracyMeters())
                .build();
    }

    public void updateEntity(AttendanceRecord entity, AttendanceRecordRequestDto dto) {
        entity.setCollaboratorId(dto.getCollaboratorId());
        entity.setWorkDate(dto.getWorkDate());
        entity.setClockIn(dto.getClockIn());
        entity.setClockOut(dto.getClockOut());
        entity.setBreakStart(dto.getBreakStart());
        entity.setBreakEnd(dto.getBreakEnd());
        entity.setBreakMinutes(dto.getBreakMinutes());
        entity.setOccurrenceType(
                dto.getOccurrenceType() != null ? dto.getOccurrenceType() : AttendanceOccurrenceTypeEnum.NORMAL_WORK);
        entity.setOccurrenceOrigin(
                dto.getOccurrenceOrigin() != null ? dto.getOccurrenceOrigin() : AttendanceOccurrenceOriginEnum.MANUAL);
        entity.setReferenceId(dto.getReferenceId());
        entity.setExpectedHours(dto.getExpectedHours());
        entity.setWorkedHours(dto.getWorkedHours());
        entity.setImpactsHourBank(dto.getImpactsHourBank() != null ? dto.getImpactsHourBank() : Boolean.TRUE);
        entity.setImpactsPayroll(dto.getImpactsPayroll() != null ? dto.getImpactsPayroll() : Boolean.TRUE);
        entity.setNotes(dto.getNotes());
        entity.setRequestType(dto.getRequestType());
        entity.setSource(dto.getSource());
        entity.setClientRequestId(dto.getClientRequestId());
        entity.setSubmittedAt(dto.getSubmittedAt());
        entity.setRequestStatus(dto.getRequestStatus());
        entity.setReviewedAt(dto.getReviewedAt());
        entity.setReviewedBy(dto.getReviewedBy());
        entity.setReviewReason(dto.getReviewReason());
        entity.setPhotoObjectId(dto.getPhotoObjectId());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setLocationAccuracyMeters(dto.getLocationAccuracyMeters());
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
                .breakStart(entity.getBreakStart())
                .breakEnd(entity.getBreakEnd())
                .breakMinutes(entity.getBreakMinutes())
                .occurrenceType(entity.getOccurrenceType())
                .occurrenceOrigin(entity.getOccurrenceOrigin())
                .referenceId(entity.getReferenceId())
                .expectedHours(entity.getExpectedHours())
                .workedHours(entity.getWorkedHours())
                .impactsHourBank(entity.getImpactsHourBank())
                .impactsPayroll(entity.getImpactsPayroll())
                .notes(entity.getNotes())
                .requestType(entity.getRequestType())
                .source(entity.getSource())
                .clientRequestId(entity.getClientRequestId())
                .submittedAt(entity.getSubmittedAt())
                .requestStatus(entity.getRequestStatus())
                .reviewedAt(entity.getReviewedAt())
                .reviewedBy(entity.getReviewedBy())
                .reviewReason(entity.getReviewReason())
                .photoObjectId(entity.getPhotoObjectId())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .locationAccuracyMeters(entity.getLocationAccuracyMeters())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
