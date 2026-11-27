package br.com.gesint.modules.gp.attendance.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

/** Resultado da apuracao de um dia de um colaborador. Minutos sempre inteiros. */
@Getter
@Builder(toBuilder = true)
public class AttendanceDayEvaluation {
    private final UUID collaboratorId;
    private final LocalDate date;
    private final AttendanceDayStatusEnum status;
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
    /** Horas extras pagas em folha (regime de hora extra ou destino escolhido na aprovacao). */
    private final int overtimeMinutes;
    /** Saldo do dia que vai para o banco de horas (positivo credito, negativo debito). */
    private final int hourBankMinutes;
    /** Falta de horas que nao vai para o banco (empresa sem banco de horas). */
    private final int debitMinutes;
    private final int lateMinutes;
    private final int earlyLeaveMinutes;
    /** Descanso entre a jornada anterior e esta, quando houver as duas marcacoes. */
    private final Integer restBeforeMinutes;
    @Builder.Default
    private final Set<AttendanceAlertEnum> alerts = EnumSet.noneOf(AttendanceAlertEnum.class);

    public boolean hasAlert(AttendanceAlertEnum alert) {
        return alerts != null && alerts.contains(alert);
    }

    /** Pendencia = algo a corrigir ou decidir neste dia. */
    public boolean isPending() {
        return status == AttendanceDayStatusEnum.INCOMPLETE
                || status == AttendanceDayStatusEnum.MISSING
                || hasAlert(AttendanceAlertEnum.PENDING_REQUEST);
    }

    /** Dia que entra na base de absenteismo (havia jornada a cumprir). */
    public boolean countsForAbsenteeism() {
        return expectedMinutes > 0
                && status != AttendanceDayStatusEnum.IN_PROGRESS
                && status != AttendanceDayStatusEnum.PENDING_START;
    }

    public boolean isAbsence() {
        return status == AttendanceDayStatusEnum.MISSING || status == AttendanceDayStatusEnum.UNJUSTIFIED_ABSENCE;
    }
}
