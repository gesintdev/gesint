package br.com.gommo.modules.rh.person.attendance.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceSourceEnum;

@Getter
@Builder
public class AttendanceRecordResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final LocalDate workDate;
    private final LocalTime clockIn;
    private final LocalTime clockOut;
    private final LocalTime breakStart;
    private final LocalTime breakEnd;
    private final Integer breakMinutes;
    private final AttendanceOccurrenceTypeEnum occurrenceType;
    private final AttendanceOccurrenceOriginEnum occurrenceOrigin;
    private final UUID referenceId;
    private final BigDecimal expectedHours;
    private final BigDecimal workedHours;
    private final Boolean impactsHourBank;
    private final Boolean impactsPayroll;
    private final String notes;
    private final AttendanceRequestTypeEnum requestType;
    private final AttendanceSourceEnum source;
    private final String clientRequestId;
    private final OffsetDateTime submittedAt;
    private final String requestStatus;
    private final OffsetDateTime reviewedAt;
    private final UUID reviewedBy;
    private final String reviewReason;
    private final UUID photoObjectId;
    private final BigDecimal latitude;
    private final BigDecimal longitude;
    private final BigDecimal locationAccuracyMeters;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
