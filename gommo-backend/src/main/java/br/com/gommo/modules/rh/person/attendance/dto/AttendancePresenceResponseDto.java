package br.com.gommo.modules.rh.person.attendance.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendancePresenceResponseDto {
    private final String id;
    private final boolean hasRecord;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final UUID photoObjectId;
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
    private final boolean present;
    private final boolean inVacation;
    private final boolean onLeaveActive;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
