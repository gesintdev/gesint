package br.com.gesint.modules.gp.dashboard.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

/** Painel da Gestao de Ponto: situacao de agora, limites legais do periodo e fila de trabalho. */
@Getter
@Builder
public class TimeDashboardResponseDto {
    private final OffsetDateTime generatedAt;
    private final LocalDate periodStart;
    private final LocalDate periodEnd;
    private final int rosterSize;
    private final boolean hourBankEnabled;
    private final boolean overtimeEnabled;
    private final NowSnapshot now;
    private final PeriodLimits limits;
    private final HourBankSnapshot hourBank;
    private final List<PendingRequest> pendingRequests;
    private final int pendingRequestsTotal;
    private final List<AttentionRow> attention;
    private final List<DailyPoint> daily;

    @Getter
    @Builder
    public static class NowSnapshot {
        private final int working;
        private final int onBreak;
        private final int late;
        private final int inOvertime;
        private final int earlyLeave;
        private final int finished;
        private final int away;
        private final int expectedToday;
    }

    @Getter
    @Builder
    public static class PeriodLimits {
        private final int overtimeMinutes;
        private final int workedMinutes;
        private final int expectedMinutes;
        private final int over10HoursDays;
        private final int over10HoursCollaborators;
        private final int overtimeOver2HoursDays;
        private final int shortBreakDays;
        private final int noBreakDays;
        private final int over6HoursWithoutBreakDays;
        private final int shortInterjourneyDays;
        private final int lateArrivalDays;
        private final int missingDays;
        private final int incompleteDays;
        private final double absenteeismPercent;
    }

    @Getter
    @Builder
    public static class HourBankSnapshot {
        private final int positiveMinutes;
        private final int negativeMinutes;
        private final int collaboratorsPositive;
        private final int collaboratorsNegative;
    }

    @Getter
    @Builder
    public static class PendingRequest {
        private final UUID id;
        private final UUID collaboratorId;
        private final String collaboratorName;
        private final String requestType;
        private final LocalDate workDate;
        private final String notes;
        private final OffsetDateTime submittedAt;
    }

    @Getter
    @Builder
    public static class AttentionRow {
        private final UUID collaboratorId;
        private final String collaboratorName;
        private final String jobTitle;
        private final UUID photoObjectId;
        private final int pendingDays;
        private final int alerts;
        private final int hourBankMinutes;
    }

    @Getter
    @Builder
    public static class DailyPoint {
        private final LocalDate date;
        private final int workedMinutes;
        private final int expectedMinutes;
        private final int overtimeMinutes;
        private final int absences;
        private final int alerts;
    }
}
