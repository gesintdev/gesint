package br.com.gesint.modules.gp.attendance.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluation;
import lombok.Builder;
import lombok.Getter;

/** Um dia apurado, como a tela e o espelho mostram. */
@Getter
@Builder
public class AttendanceDayResponseDto {
    private final LocalDate date;
    private final String status;
    private final UUID recordId;
    private final LocalTime clockIn;
    private final LocalTime breakStart;
    private final LocalTime breakEnd;
    private final LocalTime clockOut;
    private final LocalTime scheduledStart;
    private final LocalTime scheduledEnd;
    private final String occurrenceType;
    private final String occurrenceOrigin;
    private final int expectedMinutes;
    private final int workedMinutes;
    private final int breakMinutes;
    private final int overtimeMinutes;
    private final int hourBankMinutes;
    private final int debitMinutes;
    private final int lateMinutes;
    private final int earlyLeaveMinutes;
    private final Integer restBeforeMinutes;
    private final boolean pending;
    private final List<String> alerts;

    public static AttendanceDayResponseDto from(AttendanceDayEvaluation day) {
        return AttendanceDayResponseDto.builder()
                .date(day.getDate())
                .status(day.getStatus().name())
                .recordId(day.getRecordId())
                .clockIn(day.getClockIn())
                .breakStart(day.getBreakStart())
                .breakEnd(day.getBreakEnd())
                .clockOut(day.getClockOut())
                .scheduledStart(day.getScheduledStart())
                .scheduledEnd(day.getScheduledEnd())
                .occurrenceType(day.getOccurrenceType())
                .occurrenceOrigin(day.getOccurrenceOrigin())
                .expectedMinutes(day.getExpectedMinutes())
                .workedMinutes(day.getWorkedMinutes())
                .breakMinutes(day.getBreakMinutes())
                .overtimeMinutes(day.getOvertimeMinutes())
                .hourBankMinutes(day.getHourBankMinutes())
                .debitMinutes(day.getDebitMinutes())
                .lateMinutes(day.getLateMinutes())
                .earlyLeaveMinutes(day.getEarlyLeaveMinutes())
                .restBeforeMinutes(day.getRestBeforeMinutes())
                .pending(day.isPending())
                .alerts(day.getAlerts().stream().map(Enum::name).sorted().toList())
                .build();
    }
}
