package br.com.gesint.modules.gp.attendance.domain;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.Set;

import br.com.gesint.modules.gp.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gesint.modules.gp.attendance.entity.AttendanceRecord;

/**
 * Apuracao de um dia: jornada prevista x realizada, destino do saldo (banco de horas ou hora
 * extra) e limites da CLT. Logica pura, sem banco: o carregador resolve escala, feriado e
 * afastamentos antes.
 */
public final class AttendanceDayEvaluator {

    static final int TEN_HOURS = 10 * 60;
    static final int SIX_HOURS = 6 * 60;
    static final int ONE_HOUR = 60;
    static final int TWO_HOURS = 2 * 60;
    static final int ELEVEN_HOURS = 11 * 60;

    private AttendanceDayEvaluator() {}

    public static AttendanceDayEvaluation evaluate(AttendanceDayInput in) {
        AttendanceRecord record = in.getRecord();
        AttendanceDayEvaluation.AttendanceDayEvaluationBuilder out = AttendanceDayEvaluation.builder()
                .collaboratorId(in.getCollaboratorId())
                .date(in.getDate())
                .scheduledStart(in.getScheduledStart())
                .scheduledEnd(in.getScheduledEnd());
        if (record != null) {
            out.recordId(record.getId())
                    .clockIn(record.getClockIn())
                    .breakStart(record.getBreakStart())
                    .breakEnd(record.getBreakEnd())
                    .clockOut(record.getClockOut())
                    .occurrenceType(record.getOccurrenceType() != null ? record.getOccurrenceType().name() : null)
                    .occurrenceOrigin(record.getOccurrenceOrigin() != null ? record.getOccurrenceOrigin().name() : null);
        }

        Set<AttendanceAlertEnum> alerts = EnumSet.noneOf(AttendanceAlertEnum.class);
        if (in.isPendingRequest()) {
            alerts.add(AttendanceAlertEnum.PENDING_REQUEST);
        }

        if (in.isBeforeAdmission()) {
            return out.status(AttendanceDayStatusEnum.NOT_EMPLOYED).alerts(alerts).build();
        }

        int expected = in.isHoliday() ? 0 : Math.max(0, in.getExpectedMinutes());
        AttendanceOccurrenceTypeEnum occurrence = record != null ? record.getOccurrenceType() : null;

        if (in.isVacation() || occurrence == AttendanceOccurrenceTypeEnum.VACATION) {
            return out.status(AttendanceDayStatusEnum.VACATION).alerts(alerts).build();
        }
        if (in.isJustifiedLeave() || isJustifiedOccurrence(occurrence)) {
            // Dia abonado: a jornada conta como cumprida, sem credito nem debito.
            return out.status(AttendanceDayStatusEnum.LEAVE).alerts(alerts).build();
        }
        if (in.isUnjustifiedAbsence() || occurrence == AttendanceOccurrenceTypeEnum.UNJUSTIFIED_ABSENCE) {
            return allocate(out, in, AttendanceDayStatusEnum.UNJUSTIFIED_ABSENCE, expected, 0, 0, -expected, alerts, record);
        }

        boolean past = in.getDate().isBefore(in.getToday());
        boolean today = in.getDate().isEqual(in.getToday());
        boolean hasPunch = record != null
                && (record.getClockIn() != null || record.getClockOut() != null
                        || record.getBreakStart() != null || record.getBreakEnd() != null);

        if (!hasPunch) {
            int stored = storedWorkedMinutes(record);
            if (stored > 0) {
                // Lancamento manual so com total de horas (sem marcacoes).
                int diff = applyTolerance(stored - expected, in.getToleranceMinutes());
                return allocate(out, in, AttendanceDayStatusEnum.OK, expected, stored, 0, diff, alerts, record);
            }
            if (expected == 0) {
                AttendanceDayStatusEnum restStatus = in.isHoliday()
                        ? AttendanceDayStatusEnum.HOLIDAY
                        : AttendanceDayStatusEnum.DAY_OFF;
                return out.status(restStatus).alerts(alerts).build();
            }
            if (!past) {
                return out.status(AttendanceDayStatusEnum.PENDING_START).expectedMinutes(expected).alerts(alerts).build();
            }
            return allocate(out, in, AttendanceDayStatusEnum.MISSING, expected, 0, 0, -expected, alerts, record);
        }

        LocalTime clockIn = record.getClockIn();
        LocalTime clockOut = record.getClockOut();
        LocalTime breakStart = record.getBreakStart();
        LocalTime breakEnd = record.getBreakEnd();
        boolean breakComplete = breakStart != null && breakEnd != null;
        boolean breakOpen = breakStart != null && breakEnd == null;
        int breakMinutes = breakComplete
                ? minutesBetween(breakStart, breakEnd)
                : (record.getBreakMinutes() != null && breakStart == null ? Math.max(0, record.getBreakMinutes()) : 0);

        AttendanceDayStatusEnum status;
        int worked;
        if (clockIn == null) {
            status = past ? AttendanceDayStatusEnum.INCOMPLETE : AttendanceDayStatusEnum.IN_PROGRESS;
            worked = 0;
        } else if (clockOut == null) {
            if (today) {
                status = AttendanceDayStatusEnum.IN_PROGRESS;
                LocalTime end = breakOpen ? breakStart : in.getNow();
                worked = Math.max(0, minutesBetween(clockIn, end) - (breakOpen ? 0 : breakMinutes));
            } else {
                // Historico sem saida: nao inventa horas, so registra a pendencia.
                status = past ? AttendanceDayStatusEnum.INCOMPLETE : AttendanceDayStatusEnum.IN_PROGRESS;
                worked = breakStart != null ? minutesBetween(clockIn, breakStart) : 0;
            }
        } else {
            status = breakOpen || (breakStart == null && breakEnd != null)
                    ? AttendanceDayStatusEnum.INCOMPLETE
                    : AttendanceDayStatusEnum.OK;
            worked = Math.max(0, minutesBetween(clockIn, clockOut) - breakMinutes);
        }

        // Limites legais do dia (medidos sobre o que foi trabalhado).
        if (worked > TEN_HOURS) {
            alerts.add(AttendanceAlertEnum.OVER_10_HOURS);
        }
        if (worked > SIX_HOURS && clockOut != null) {
            if (breakMinutes == 0 && breakStart == null) {
                alerts.add(AttendanceAlertEnum.NO_BREAK);
            } else if (breakMinutes > 0 && breakMinutes < ONE_HOUR) {
                alerts.add(AttendanceAlertEnum.SHORT_BREAK);
            }
        }
        if (longestContinuousBlock(clockIn, breakStart, breakEnd, clockOut, today ? in.getNow() : null) > SIX_HOURS) {
            alerts.add(AttendanceAlertEnum.OVER_6_HOURS_WITHOUT_BREAK);
        }

        Integer restBefore = restBetween(in.getPreviousRecord(), in.getDate(), clockIn);
        if (restBefore != null && restBefore < ELEVEN_HOURS) {
            alerts.add(AttendanceAlertEnum.SHORT_INTERJOURNEY);
        }

        int late = 0;
        if (expected > 0 && in.getScheduledStart() != null && clockIn != null && clockIn.isAfter(in.getScheduledStart())) {
            late = minutesBetween(in.getScheduledStart(), clockIn);
            if (late > 12 * 60) {
                late = 0; // entrada em outro turno, nao e atraso
            } else if (late > in.getToleranceMinutes()) {
                alerts.add(AttendanceAlertEnum.LATE_ARRIVAL);
            }
        }
        int earlyLeave = 0;
        LocalTime scheduledEnd = in.getScheduledEnd();
        if (expected > 0 && status == AttendanceDayStatusEnum.OK && scheduledEnd != null && clockOut != null
                && in.getScheduledStart() != null && scheduledEnd.isAfter(in.getScheduledStart())
                && clockOut.isBefore(scheduledEnd) && clockOut.isAfter(clockIn)) {
            earlyLeave = minutesBetween(clockOut, scheduledEnd);
            if (earlyLeave > in.getToleranceMinutes()) {
                alerts.add(AttendanceAlertEnum.EARLY_LEAVE);
            }
        }
        out.lateMinutes(late).earlyLeaveMinutes(earlyLeave).restBeforeMinutes(restBefore);

        if (status == AttendanceDayStatusEnum.IN_PROGRESS) {
            // Jornada aberta nao mexe no saldo ate fechar.
            return out.status(status).expectedMinutes(expected).workedMinutes(worked)
                    .breakMinutes(breakMinutes).alerts(alerts).build();
        }

        int rawDiff = worked - expected;
        if (rawDiff > TWO_HOURS && expected > 0) {
            alerts.add(AttendanceAlertEnum.OVERTIME_OVER_2_HOURS);
        }
        int diff = status == AttendanceDayStatusEnum.OK ? applyTolerance(rawDiff, in.getToleranceMinutes()) : rawDiff;
        if (status == AttendanceDayStatusEnum.OK && expected == 0) {
            status = in.isHoliday() ? AttendanceDayStatusEnum.HOLIDAY : AttendanceDayStatusEnum.DAY_OFF;
            diff = worked;
        }
        return allocate(out, in, status, expected, worked, breakMinutes, diff, alerts, record);
    }

    /** Divide o saldo do dia entre banco de horas, hora extra paga e falta. */
    private static AttendanceDayEvaluation allocate(
            AttendanceDayEvaluation.AttendanceDayEvaluationBuilder out,
            AttendanceDayInput in,
            AttendanceDayStatusEnum status,
            int expected,
            int worked,
            int breakMinutes,
            int diff,
            Set<AttendanceAlertEnum> alerts,
            AttendanceRecord record) {
        int overtime = 0;
        int bank = 0;
        int debit = 0;
        if (diff > 0) {
            boolean paidByDecision = record != null
                    && Boolean.TRUE.equals(record.getImpactsPayroll())
                    && !Boolean.TRUE.equals(record.getImpactsHourBank())
                    && record.getOccurrenceType() == AttendanceOccurrenceTypeEnum.TIME_ADJUSTMENT;
            if (paidByDecision && in.isOvertimeEnabled()) {
                overtime = diff;
            } else if (in.isHourBankEnabled()) {
                bank = diff;
            } else if (in.isOvertimeEnabled()) {
                overtime = diff;
            } else {
                bank = diff;
            }
        } else if (diff < 0) {
            if (in.isHourBankEnabled()) {
                bank = diff;
            } else {
                debit = -diff;
            }
        }
        return out.status(status)
                .expectedMinutes(expected)
                .workedMinutes(worked)
                .breakMinutes(breakMinutes)
                .overtimeMinutes(overtime)
                .hourBankMinutes(bank)
                .debitMinutes(debit)
                .alerts(alerts)
                .build();
    }

    static int applyTolerance(int diff, int tolerance) {
        return Math.abs(diff) <= Math.max(0, tolerance) ? 0 : diff;
    }

    private static boolean isJustifiedOccurrence(AttendanceOccurrenceTypeEnum occurrence) {
        return occurrence == AttendanceOccurrenceTypeEnum.MEDICAL_CERTIFICATE
                || occurrence == AttendanceOccurrenceTypeEnum.LEAVE_ABSENCE
                || occurrence == AttendanceOccurrenceTypeEnum.LICENSE;
    }

    private static int storedWorkedMinutes(AttendanceRecord record) {
        if (record == null || record.getWorkedHours() == null) {
            return 0;
        }
        return record.getWorkedHours().multiply(java.math.BigDecimal.valueOf(60)).intValue();
    }

    private static int longestContinuousBlock(
            LocalTime clockIn, LocalTime breakStart, LocalTime breakEnd, LocalTime clockOut, LocalTime now) {
        if (clockIn == null) {
            return 0;
        }
        LocalTime end = clockOut != null ? clockOut : now;
        if (breakStart != null) {
            int first = minutesBetween(clockIn, breakStart);
            int second = breakEnd != null && end != null ? minutesBetween(breakEnd, end) : 0;
            return Math.max(first, second);
        }
        return end != null ? minutesBetween(clockIn, end) : 0;
    }

    private static Integer restBetween(AttendanceRecord previous, java.time.LocalDate date, LocalTime clockIn) {
        if (previous == null || previous.getClockOut() == null || clockIn == null || previous.getWorkDate() == null) {
            return null;
        }
        LocalDateTime previousEnd = previous.getWorkDate().atTime(previous.getClockOut());
        if (previous.getClockIn() != null && previous.getClockOut().isBefore(previous.getClockIn())) {
            previousEnd = previousEnd.plusDays(1);
        }
        long minutes = Duration.between(previousEnd, date.atTime(clockIn)).toMinutes();
        return minutes < 0 ? null : (int) minutes;
    }

    static int minutesBetween(LocalTime start, LocalTime end) {
        if (start == null || end == null) {
            return 0;
        }
        int minutes = (int) Duration.between(start, end).toMinutes();
        return minutes < 0 ? minutes + 24 * 60 : minutes;
    }
}
