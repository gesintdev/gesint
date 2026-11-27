package br.com.gesint.modules.gp.attendance.domain;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import br.com.gesint.modules.gp.attendance.entity.AttendanceRecord;
import lombok.Builder;
import lombok.Getter;

/** Tudo que o avaliador precisa saber de um dia, ja resolvido pelo carregador. */
@Getter
@Builder
public class AttendanceDayInput {
    private final UUID collaboratorId;
    private final LocalDate date;
    private final LocalDate today;
    private final LocalTime now;
    /** Jornada prevista pela escala (0 em folga). */
    private final int expectedMinutes;
    private final LocalTime scheduledStart;
    private final LocalTime scheduledEnd;
    private final boolean holiday;
    private final boolean vacation;
    private final boolean justifiedLeave;
    private final boolean unjustifiedAbsence;
    private final boolean beforeAdmission;
    private final boolean pendingRequest;
    private final AttendanceRecord record;
    /** Registro do dia anterior, para medir a interjornada. */
    private final AttendanceRecord previousRecord;
    private final int toleranceMinutes;
    private final boolean hourBankEnabled;
    private final boolean overtimeEnabled;
}
