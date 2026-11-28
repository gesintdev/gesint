package br.com.gesint.modules.gp.attendance.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

/** Dias apurados de um colaborador no periodo, com os dados de cabecalho. */
@Getter
@Builder
public class CollaboratorPeriodEvaluation {
    private final UUID collaboratorId;
    private final Integer collaboratorCode;
    private final String collaboratorName;
    private final UUID photoObjectId;
    private final UUID companyId;
    private final String jobTitle;
    private final String departmentName;
    private final UUID workScheduleId;
    private final String workScheduleName;
    private final LocalDate admissionDate;
    private final List<AttendanceDayEvaluation> days;

    public int sumWorked() {
        return days.stream().mapToInt(AttendanceDayEvaluation::getWorkedMinutes).sum();
    }

    public int sumExpected() {
        return days.stream().mapToInt(AttendanceDayEvaluation::getExpectedMinutes).sum();
    }

    public int sumOvertime() {
        return days.stream().mapToInt(AttendanceDayEvaluation::getOvertimeMinutes).sum();
    }

    public int sumHourBank() {
        return days.stream().mapToInt(AttendanceDayEvaluation::getHourBankMinutes).sum();
    }

    public int sumDebit() {
        return days.stream().mapToInt(AttendanceDayEvaluation::getDebitMinutes).sum();
    }

    public long pendingDays() {
        return days.stream().filter(AttendanceDayEvaluation::isPending).count();
    }

    public long countStatus(AttendanceDayStatusEnum status) {
        return days.stream().filter(day -> day.getStatus() == status).count();
    }

    public long countAlert(AttendanceAlertEnum alert) {
        return days.stream().filter(day -> day.hasAlert(alert)).count();
    }
}
