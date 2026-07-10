package br.com.gommo.modules.rh.person.attendance.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceSourceEnum;

@Getter
@Builder
public class AttendanceRequestResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final LocalDate workDate;
    private final UUID attendanceRecordId;
    private final LocalTime originalClockIn;
    private final LocalTime originalClockOut;
    private final LocalTime originalBreakStart;
    private final LocalTime originalBreakEnd;
    private final Integer originalBreakMinutes;
    private final String originalNotes;
    private final LocalTime clockIn;
    private final LocalTime clockOut;
    private final LocalTime breakStart;
    private final LocalTime breakEnd;
    private final Integer breakMinutes;
    private final BigDecimal expectedHours;
    private final BigDecimal workedHours;
    private final String notes;
    private final AttendanceRequestTypeEnum requestType;
    private final AttendanceSourceEnum source;
    private final String clientRequestId;
    private final OffsetDateTime submittedAt;
    private final String requestStatus;
    private final OffsetDateTime reviewedAt;
    private final UUID reviewedBy;
    private final String reviewReason;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
