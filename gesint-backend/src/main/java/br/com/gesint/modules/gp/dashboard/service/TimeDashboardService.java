package br.com.gesint.modules.gp.dashboard.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.gp.attendance.domain.AttendanceAlertEnum;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluation;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayStatusEnum;
import br.com.gesint.modules.gp.attendance.domain.CollaboratorPeriodEvaluation;
import br.com.gesint.modules.gp.attendance.entity.AttendanceRequest;
import br.com.gesint.modules.gp.attendance.repository.AttendanceRequestRepository;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.dashboard.dto.TimeDashboardResponseDto;
import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;

@Service
public class TimeDashboardService implements ITimeDashboardService {

    private static final String REQUEST_PENDING = "PENDING";
    private static final int PENDING_REQUESTS_LIMIT = 8;
    private static final int ATTENTION_LIMIT = 6;

    private final AttendanceEvaluationService evaluationService;
    private final AttendanceRequestRepository requestRepository;

    public TimeDashboardService(
            AttendanceEvaluationService evaluationService, AttendanceRequestRepository requestRepository) {
        this.evaluationService = evaluationService;
        this.requestRepository = requestRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public TimeDashboardResponseDto dashboard(LocalDate from, LocalDate to) {
        LocalDate today = evaluationService.today();
        LocalDate start = from != null ? from : today.withDayOfMonth(1);
        LocalDate end = to != null ? to : today;
        if (start.isAfter(end)) {
            LocalDate swap = start;
            start = end;
            end = swap;
        }
        TimeTrackingSettings settings = evaluationService.settings();
        List<CollaboratorPeriodEvaluation> period = evaluationService.evaluate(start, end, null, settings);
        List<CollaboratorPeriodEvaluation> todayEvaluation = end.isEqual(today)
                ? period.stream().map(evaluation -> onlyDay(evaluation, today)).toList()
                : evaluationService.evaluate(today, today, null, settings);
        Map<UUID, Integer> balances = settings.isHourBankEnabled()
                ? evaluationService.hourBankBalanceUntil(end, period.stream().map(CollaboratorPeriodEvaluation::getCollaboratorId).toList())
                : Map.of();

        Map<UUID, String> names = new HashMap<>();
        period.forEach(evaluation -> names.put(evaluation.getCollaboratorId(), evaluation.getCollaboratorName()));

        List<AttendanceRequest> pending = requestRepository
                .findByRequestStatusAndStatusNotOrderBySubmittedAtDesc(REQUEST_PENDING, StatusEnum.DELETED)
                .stream()
                .filter(request -> names.containsKey(request.getCollaboratorId()))
                .filter(request -> request.getWorkDate() == null || !request.getWorkDate().isBefore(today.minusDays(90)))
                .toList();

        return TimeDashboardResponseDto.builder()
                .generatedAt(OffsetDateTime.now(AttendanceEvaluationService.BUSINESS_ZONE))
                .periodStart(start)
                .periodEnd(end)
                .rosterSize(period.size())
                .hourBankEnabled(settings.isHourBankEnabled())
                .overtimeEnabled(settings.isOvertimeEnabled())
                .now(nowSnapshot(todayEvaluation, settings.getToleranceMinutes()))
                .limits(limits(period))
                .hourBank(hourBank(balances))
                .pendingRequests(pending.stream().limit(PENDING_REQUESTS_LIMIT)
                        .map(request -> TimeDashboardResponseDto.PendingRequest.builder()
                                .id(request.getId())
                                .collaboratorId(request.getCollaboratorId())
                                .collaboratorName(names.get(request.getCollaboratorId()))
                                .requestType(request.getRequestType() != null ? request.getRequestType().name() : null)
                                .workDate(request.getWorkDate())
                                .notes(request.getNotes())
                                .submittedAt(request.getSubmittedAt())
                                .build())
                        .toList())
                .pendingRequestsTotal(pending.size())
                .attention(attention(period, balances))
                .daily(daily(period, start, end))
                .build();
    }

    private static CollaboratorPeriodEvaluation onlyDay(CollaboratorPeriodEvaluation evaluation, LocalDate date) {
        return CollaboratorPeriodEvaluation.builder()
                .collaboratorId(evaluation.getCollaboratorId())
                .collaboratorName(evaluation.getCollaboratorName())
                .days(evaluation.getDays().stream().filter(day -> day.getDate().isEqual(date)).toList())
                .build();
    }

    static TimeDashboardResponseDto.NowSnapshot nowSnapshot(List<CollaboratorPeriodEvaluation> today, int tolerance) {
        LocalTime now = LocalTime.now(AttendanceEvaluationService.BUSINESS_ZONE);
        int working = 0;
        int onBreak = 0;
        int late = 0;
        int inOvertime = 0;
        int earlyLeave = 0;
        int finished = 0;
        int away = 0;
        int expected = 0;
        for (CollaboratorPeriodEvaluation evaluation : today) {
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                switch (day.getStatus()) {
                    case IN_PROGRESS -> {
                        expected++;
                        if (day.getBreakStart() != null && day.getBreakEnd() == null) {
                            onBreak++;
                        } else {
                            working++;
                        }
                        if (day.getExpectedMinutes() == 0 || day.getWorkedMinutes() > day.getExpectedMinutes()) {
                            inOvertime++;
                        }
                    }
                    case PENDING_START -> {
                        expected++;
                        if (day.getScheduledStart() != null && now.isAfter(day.getScheduledStart().plusMinutes(tolerance))) {
                            late++;
                        }
                    }
                    case OK -> {
                        expected++;
                        finished++;
                        if (day.hasAlert(AttendanceAlertEnum.EARLY_LEAVE)) {
                            earlyLeave++;
                        }
                    }
                    case VACATION, LEAVE, UNJUSTIFIED_ABSENCE -> away++;
                    default -> {
                        // folga, feriado e antes da admissao nao contam
                    }
                }
            }
        }
        return TimeDashboardResponseDto.NowSnapshot.builder()
                .working(working)
                .onBreak(onBreak)
                .late(late)
                .inOvertime(inOvertime)
                .earlyLeave(earlyLeave)
                .finished(finished)
                .away(away)
                .expectedToday(expected)
                .build();
    }

    static TimeDashboardResponseDto.PeriodLimits limits(List<CollaboratorPeriodEvaluation> period) {
        int extra = 0;
        int worked = 0;
        int expected = 0;
        int absenceMinutes = 0;
        int absenteeismBase = 0;
        int over10Collaborators = 0;
        for (CollaboratorPeriodEvaluation evaluation : period) {
            boolean over10 = false;
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                extra += day.getOvertimeMinutes() + Math.max(0, day.getHourBankMinutes());
                worked += day.getWorkedMinutes();
                expected += day.getExpectedMinutes();
                if (day.countsForAbsenteeism()) {
                    absenteeismBase += day.getExpectedMinutes();
                    if (day.isAbsence()) {
                        absenceMinutes += day.getExpectedMinutes();
                    }
                }
                over10 |= day.hasAlert(AttendanceAlertEnum.OVER_10_HOURS);
            }
            if (over10) {
                over10Collaborators++;
            }
        }
        double absenteeism = absenteeismBase == 0 ? 0 : Math.round(absenceMinutes * 1000.0 / absenteeismBase) / 10.0;
        return TimeDashboardResponseDto.PeriodLimits.builder()
                .overtimeMinutes(extra)
                .workedMinutes(worked)
                .expectedMinutes(expected)
                .over10HoursDays(countAlert(period, AttendanceAlertEnum.OVER_10_HOURS))
                .over10HoursCollaborators(over10Collaborators)
                .overtimeOver2HoursDays(countAlert(period, AttendanceAlertEnum.OVERTIME_OVER_2_HOURS))
                .shortBreakDays(countAlert(period, AttendanceAlertEnum.SHORT_BREAK))
                .noBreakDays(countAlert(period, AttendanceAlertEnum.NO_BREAK))
                .over6HoursWithoutBreakDays(countAlert(period, AttendanceAlertEnum.OVER_6_HOURS_WITHOUT_BREAK))
                .shortInterjourneyDays(countAlert(period, AttendanceAlertEnum.SHORT_INTERJOURNEY))
                .lateArrivalDays(countAlert(period, AttendanceAlertEnum.LATE_ARRIVAL))
                .missingDays(countStatus(period, AttendanceDayStatusEnum.MISSING))
                .incompleteDays(countStatus(period, AttendanceDayStatusEnum.INCOMPLETE))
                .absenteeismPercent(absenteeism)
                .build();
    }

    private static TimeDashboardResponseDto.HourBankSnapshot hourBank(Map<UUID, Integer> balances) {
        int positive = 0;
        int negative = 0;
        int positiveCount = 0;
        int negativeCount = 0;
        for (int balance : balances.values()) {
            if (balance > 0) {
                positive += balance;
                positiveCount++;
            } else if (balance < 0) {
                negative += balance;
                negativeCount++;
            }
        }
        return TimeDashboardResponseDto.HourBankSnapshot.builder()
                .positiveMinutes(positive)
                .negativeMinutes(negative)
                .collaboratorsPositive(positiveCount)
                .collaboratorsNegative(negativeCount)
                .build();
    }

    private static List<TimeDashboardResponseDto.AttentionRow> attention(
            List<CollaboratorPeriodEvaluation> period, Map<UUID, Integer> balances) {
        List<TimeDashboardResponseDto.AttentionRow> rows = new ArrayList<>();
        for (CollaboratorPeriodEvaluation evaluation : period) {
            int pending = (int) evaluation.pendingDays();
            int alerts = evaluation.getDays().stream()
                    .mapToInt(day -> (int) day.getAlerts().stream()
                            .filter(alert -> alert != AttendanceAlertEnum.PENDING_REQUEST)
                            .count())
                    .sum();
            if (pending == 0 && alerts == 0) {
                continue;
            }
            rows.add(TimeDashboardResponseDto.AttentionRow.builder()
                    .collaboratorId(evaluation.getCollaboratorId())
                    .collaboratorName(evaluation.getCollaboratorName())
                    .jobTitle(evaluation.getJobTitle())
                    .photoObjectId(evaluation.getPhotoObjectId())
                    .pendingDays(pending)
                    .alerts(alerts)
                    .hourBankMinutes(balances.getOrDefault(evaluation.getCollaboratorId(), 0))
                    .build());
        }
        rows.sort(Comparator
                .comparingInt((TimeDashboardResponseDto.AttentionRow row) -> row.getPendingDays() * 3 + row.getAlerts())
                .reversed()
                .thenComparing(TimeDashboardResponseDto.AttentionRow::getCollaboratorName, String.CASE_INSENSITIVE_ORDER));
        return rows.stream().limit(ATTENTION_LIMIT).toList();
    }

    private static List<TimeDashboardResponseDto.DailyPoint> daily(
            List<CollaboratorPeriodEvaluation> period, LocalDate start, LocalDate end) {
        Map<LocalDate, int[]> totals = new HashMap<>();
        for (CollaboratorPeriodEvaluation evaluation : period) {
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                int[] bucket = totals.computeIfAbsent(day.getDate(), key -> new int[5]);
                bucket[0] += day.getWorkedMinutes();
                bucket[1] += day.getExpectedMinutes();
                bucket[2] += day.getOvertimeMinutes() + Math.max(0, day.getHourBankMinutes());
                bucket[3] += day.isAbsence() ? 1 : 0;
                bucket[4] += (int) day.getAlerts().stream().filter(alert -> alert != AttendanceAlertEnum.PENDING_REQUEST).count();
            }
        }
        List<TimeDashboardResponseDto.DailyPoint> points = new ArrayList<>();
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            int[] bucket = totals.getOrDefault(date, new int[5]);
            points.add(TimeDashboardResponseDto.DailyPoint.builder()
                    .date(date)
                    .workedMinutes(bucket[0])
                    .expectedMinutes(bucket[1])
                    .overtimeMinutes(bucket[2])
                    .absences(bucket[3])
                    .alerts(bucket[4])
                    .build());
        }
        return points;
    }

    private static int countAlert(List<CollaboratorPeriodEvaluation> period, AttendanceAlertEnum alert) {
        return (int) period.stream().mapToLong(evaluation -> evaluation.countAlert(alert)).sum();
    }

    private static int countStatus(List<CollaboratorPeriodEvaluation> period, AttendanceDayStatusEnum status) {
        return (int) period.stream().mapToLong(evaluation -> evaluation.countStatus(status)).sum();
    }
}
