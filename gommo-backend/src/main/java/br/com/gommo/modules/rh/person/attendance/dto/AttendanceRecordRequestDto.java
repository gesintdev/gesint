package br.com.gommo.modules.rh.person.attendance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceOriginEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceRequestTypeEnum;
import br.com.gommo.modules.rh.person.attendance.entity.AttendanceSourceEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordRequestDto {
    @NotNull private UUID collaboratorId;

    @NotNull private LocalDate workDate;

    private LocalTime clockIn;
    private LocalTime clockOut;
    private Integer breakMinutes;
    private AttendanceOccurrenceTypeEnum occurrenceType;
    private AttendanceOccurrenceOriginEnum occurrenceOrigin;
    private UUID referenceId;
    private BigDecimal expectedHours;
    private BigDecimal workedHours;
    private Boolean impactsHourBank;
    private Boolean impactsPayroll;
    private String notes;
    private AttendanceRequestTypeEnum requestType;
    private AttendanceSourceEnum source;
    private String clientRequestId;
    private OffsetDateTime submittedAt;
}
