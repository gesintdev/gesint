package br.com.gesint.modules.gp.report.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.function.Predicate;
import java.util.function.ToIntFunction;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.modules.gp.attendance.domain.AttendanceAlertEnum;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayEvaluation;
import br.com.gesint.modules.gp.attendance.domain.AttendanceDayStatusEnum;
import br.com.gesint.modules.gp.attendance.domain.CollaboratorPeriodEvaluation;
import br.com.gesint.modules.gp.attendance.service.AttendanceEvaluationService;
import br.com.gesint.modules.gp.report.dto.TimeStatusMetricEnum;
import br.com.gesint.modules.gp.report.dto.TimeStatusReportResponseDto;
import br.com.gesint.modules.gp.report.dto.TimeStatusReportResponseDto.Row;
import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;

@Service
public class TimeStatusReportService implements ITimeStatusReportService {

    private final AttendanceEvaluationService evaluationService;

    public TimeStatusReportService(AttendanceEvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('attendance:read')")
    public TimeStatusReportResponseDto report(TimeStatusMetricEnum metric, LocalDate from, LocalDate to) {
        LocalDate today = evaluationService.today();
        LocalDate start;
        LocalDate end;
        if (metric.isToday()) {
            start = today;
            end = today;
        } else {
            start = from != null ? from : today.withDayOfMonth(1);
            end = to != null ? to : today;
            if (start.isAfter(end)) {
                LocalDate swap = start;
                start = end;
                end = swap;
            }
        }
        TimeTrackingSettings settings = evaluationService.settings();
        List<CollaboratorPeriodEvaluation> evaluations = evaluationService.evaluate(start, end, null, settings);
        List<Row> rows = switch (metric) {
            case WORKING -> today(evaluations, day -> day.getStatus() == AttendanceDayStatusEnum.IN_PROGRESS
                    && !(day.getBreakStart() != null && day.getBreakEnd() == null), AttendanceDayEvaluation::getWorkedMinutes);
            case ON_BREAK -> today(evaluations, day -> day.getStatus() == AttendanceDayStatusEnum.IN_PROGRESS
                    && day.getBreakStart() != null && day.getBreakEnd() == null, AttendanceDayEvaluation::getWorkedMinutes);
            case IN_OVERTIME -> today(evaluations, day -> day.getStatus() == AttendanceDayStatusEnum.IN_PROGRESS
                    && (day.getExpectedMinutes() == 0 || day.getWorkedMinutes() > day.getExpectedMinutes()),
                    day -> day.getWorkedMinutes() - day.getExpectedMinutes());
            case LATE -> {
                LocalTime now = LocalTime.now(AttendanceEvaluationService.BUSINESS_ZONE);
                int tolerance = settings.getToleranceMinutes();
                yield today(evaluations, day -> day.getStatus() == AttendanceDayStatusEnum.PENDING_START
                        && day.getScheduledStart() != null
                        && now.isAfter(day.getScheduledStart().plusMinutes(tolerance)),
                        day -> (int) java.time.Duration.between(day.getScheduledStart(), now).toMinutes());
            }
            case EARLY_LEAVE_TODAY -> today(evaluations, day -> day.hasAlert(AttendanceAlertEnum.EARLY_LEAVE),
                    AttendanceDayEvaluation::getEarlyLeaveMinutes);
            case AWAY -> today(evaluations, day -> day.getStatus() == AttendanceDayStatusEnum.VACATION
                    || day.getStatus() == AttendanceDayStatusEnum.LEAVE
                    || day.getStatus() == AttendanceDayStatusEnum.UNJUSTIFIED_ABSENCE, day -> 0);
            case ABSENTEEISM -> absenteeism(evaluations);
            case OVERTIME -> overtime(evaluations);
            case OVER_10_HOURS -> days(evaluations, alert(AttendanceAlertEnum.OVER_10_HOURS), AttendanceDayEvaluation::getWorkedMinutes);
            case OVERTIME_OVER_2_HOURS -> days(evaluations, alert(AttendanceAlertEnum.OVERTIME_OVER_2_HOURS),
                    day -> day.getWorkedMinutes() - day.getExpectedMinutes());
            case OVER_6_HOURS_WITHOUT_BREAK -> days(evaluations, alert(AttendanceAlertEnum.OVER_6_HOURS_WITHOUT_BREAK),
                    AttendanceDayEvaluation::getWorkedMinutes);
            case NO_BREAK -> days(evaluations, alert(AttendanceAlertEnum.NO_BREAK), AttendanceDayEvaluation::getWorkedMinutes);
            case SHORT_BREAK -> days(evaluations, alert(AttendanceAlertEnum.SHORT_BREAK), AttendanceDayEvaluation::getBreakMinutes);
            case SHORT_INTERJOURNEY -> days(evaluations, alert(AttendanceAlertEnum.SHORT_INTERJOURNEY),
                    day -> day.getRestBeforeMinutes() != null ? day.getRestBeforeMinutes() : 0);
            case LATE_ARRIVAL -> days(evaluations, alert(AttendanceAlertEnum.LATE_ARRIVAL), AttendanceDayEvaluation::getLateMinutes);
            case EARLY_LEAVE -> days(evaluations, alert(AttendanceAlertEnum.EARLY_LEAVE), AttendanceDayEvaluation::getEarlyLeaveMinutes);
            case MISSING_DAYS -> days(evaluations, day -> day.getStatus() == AttendanceDayStatusEnum.MISSING,
                    AttendanceDayEvaluation::getExpectedMinutes);
            case INCOMPLETE_DAYS -> days(evaluations, day -> day.getStatus() == AttendanceDayStatusEnum.INCOMPLETE,
                    AttendanceDayEvaluation::getWorkedMinutes);
        };
        return TimeStatusReportResponseDto.builder()
                .metric(metric)
                .periodStart(start)
                .periodEnd(end)
                .totalMinutes(rows.stream().mapToInt(Row::getMinutes).sum())
                .rows(rows)
                .build();
    }

    private static Predicate<AttendanceDayEvaluation> alert(AttendanceAlertEnum alert) {
        return day -> day.hasAlert(alert);
    }

    private static List<Row> today(
            List<CollaboratorPeriodEvaluation> evaluations,
            Predicate<AttendanceDayEvaluation> filter,
            ToIntFunction<AttendanceDayEvaluation> minutes) {
        return days(evaluations, filter, minutes);
    }

    private static List<Row> days(
            List<CollaboratorPeriodEvaluation> evaluations,
            Predicate<AttendanceDayEvaluation> filter,
            ToIntFunction<AttendanceDayEvaluation> minutes) {
        List<Row> rows = new ArrayList<>();
        for (CollaboratorPeriodEvaluation evaluation : evaluations) {
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                if (!filter.test(day)) {
                    continue;
                }
                rows.add(baseRow(evaluation)
                        .id(evaluation.getCollaboratorId() + ":" + day.getDate())
                        .date(day.getDate())
                        .clockIn(day.getClockIn())
                        .clockOut(day.getClockOut())
                        .scheduledStart(day.getScheduledStart())
                        .minutes(Math.max(0, minutes.applyAsInt(day)))
                        .expectedMinutes(day.getExpectedMinutes())
                        .days(1)
                        .build());
            }
        }
        rows.sort(Comparator.comparing(Row::getDate, Comparator.reverseOrder())
                .thenComparing(Row::getCollaboratorName, String.CASE_INSENSITIVE_ORDER));
        return rows;
    }

    private static List<Row> absenteeism(List<CollaboratorPeriodEvaluation> evaluations) {
        List<Row> rows = new ArrayList<>();
        for (CollaboratorPeriodEvaluation evaluation : evaluations) {
            int base = 0;
            int absent = 0;
            int absentDays = 0;
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                if (!day.countsForAbsenteeism()) {
                    continue;
                }
                base += day.getExpectedMinutes();
                if (day.isAbsence()) {
                    absent += day.getExpectedMinutes();
                    absentDays++;
                }
            }
            double percent = base == 0 ? 0 : Math.round(absent * 1000.0 / base) / 10.0;
            rows.add(baseRow(evaluation)
                    .id(evaluation.getCollaboratorId().toString())
                    .minutes(absent)
                    .expectedMinutes(base)
                    .days(absentDays)
                    .percent(percent)
                    .build());
        }
        rows.sort(Comparator.comparing(Row::getPercent, Comparator.reverseOrder())
                .thenComparing(Row::getCollaboratorName, String.CASE_INSENSITIVE_ORDER));
        return rows;
    }

    private static List<Row> overtime(List<CollaboratorPeriodEvaluation> evaluations) {
        List<Row> rows = new ArrayList<>();
        for (CollaboratorPeriodEvaluation evaluation : evaluations) {
            int minutes = 0;
            int days = 0;
            for (AttendanceDayEvaluation day : evaluation.getDays()) {
                int extra = day.getOvertimeMinutes() + Math.max(0, day.getHourBankMinutes());
                if (extra > 0) {
                    minutes += extra;
                    days++;
                }
            }
            if (minutes == 0) {
                continue;
            }
            rows.add(baseRow(evaluation)
                    .id(evaluation.getCollaboratorId().toString())
                    .minutes(minutes)
                    .expectedMinutes(evaluation.sumExpected())
                    .days(days)
                    .build());
        }
        rows.sort(Comparator.comparingInt(Row::getMinutes).reversed());
        return rows;
    }

    private static Row.RowBuilder baseRow(CollaboratorPeriodEvaluation evaluation) {
        return Row.builder()
                .collaboratorId(evaluation.getCollaboratorId())
                .collaboratorName(evaluation.getCollaboratorName())
                .jobTitle(evaluation.getJobTitle())
                .departmentName(evaluation.getDepartmentName());
    }
}
