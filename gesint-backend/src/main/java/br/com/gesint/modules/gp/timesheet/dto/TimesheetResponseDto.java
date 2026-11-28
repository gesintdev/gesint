package br.com.gesint.modules.gp.timesheet.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gesint.modules.gp.attendance.dto.AttendanceDayResponseDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TimesheetResponseDto {
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final boolean hourBankEnabled;
    private final boolean overtimeEnabled;
    private final List<Row> rows;

    @Getter
    @Builder
    public static class Row {
        private final String id;
        private final UUID collaboratorId;
        private final String collaboratorName;
        private final String jobTitle;
        private final UUID photoObjectId;
        private final String workScheduleName;
        private final int expectedMinutes;
        private final int workedMinutes;
        private final int overtimeMinutes;
        private final int hourBankMinutes;
        private final int pendingCount;
        private final String closingStatus;
        private final OffsetDateTime closedAt;
    }

    @Getter
    @Builder
    public static class Detail {
        private final UUID collaboratorId;
        private final Integer collaboratorCode;
        private final String collaboratorName;
        private final String jobTitle;
        private final String departmentName;
        private final String workScheduleName;
        private final LocalDate admissionDate;
        private final LocalDate periodStart;
        private final LocalDate periodEnd;
        private final String closingStatus;
        private final OffsetDateTime closedAt;
        private final String reopenReason;
        private final boolean hourBankEnabled;
        private final boolean overtimeEnabled;
        private final int expectedMinutes;
        private final int workedMinutes;
        private final int overtimeMinutes;
        private final int hourBankMinutes;
        private final int debitMinutes;
        private final int previousBalanceMinutes;
        private final int totalBalanceMinutes;
        private final int pendingCount;
        private final List<AttendanceDayResponseDto> days;
    }

    @Getter
    @Builder
    public static class CloseResult {
        private final int closed;
        private final List<String> skippedWithPending;
    }
}
