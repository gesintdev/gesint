package br.com.gesint.modules.gp.attendance.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.Test;

import br.com.gesint.modules.gp.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gesint.modules.gp.attendance.entity.AttendanceRecord;

class AttendanceDayEvaluatorTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 27);
    private static final LocalDate DAY = LocalDate.of(2026, 11, 25);

    private static AttendanceDayInput.AttendanceDayInputBuilder input() {
        return AttendanceDayInput.builder()
                .date(DAY)
                .today(TODAY)
                .now(LocalTime.of(10, 0))
                .expectedMinutes(8 * 60)
                .scheduledStart(LocalTime.of(8, 0))
                .scheduledEnd(LocalTime.of(17, 0))
                .toleranceMinutes(10)
                .hourBankEnabled(true)
                .overtimeEnabled(false);
    }

    private static AttendanceRecord record(String in, String breakStart, String breakEnd, String out) {
        return AttendanceRecord.builder()
                .workDate(DAY)
                .clockIn(in != null ? LocalTime.parse(in) : null)
                .breakStart(breakStart != null ? LocalTime.parse(breakStart) : null)
                .breakEnd(breakEnd != null ? LocalTime.parse(breakEnd) : null)
                .clockOut(out != null ? LocalTime.parse(out) : null)
                .occurrenceType(AttendanceOccurrenceTypeEnum.NORMAL_WORK)
                .build();
    }

    @Test
    void jornadaCumpridaDentroDaToleranciaNaoGeraSaldo() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().record(record("08:05", "12:00", "13:00", "17:03")).build());
        assertThat(day.getStatus()).isEqualTo(AttendanceDayStatusEnum.OK);
        assertThat(day.getWorkedMinutes()).isEqualTo(478);
        assertThat(day.getHourBankMinutes()).isZero();
        assertThat(day.getAlerts()).doesNotContain(AttendanceAlertEnum.LATE_ARRIVAL);
    }

    @Test
    void horaAMaisVaiParaOBancoQuandoEmpresaUsaBanco() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().record(record("08:00", "12:00", "13:00", "19:00")).build());
        assertThat(day.getHourBankMinutes()).isEqualTo(120);
        assertThat(day.getOvertimeMinutes()).isZero();
    }

    @Test
    void horaAMaisViraHoraExtraQuandoEmpresaNaoUsaBanco() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().hourBankEnabled(false).overtimeEnabled(true)
                        .record(record("08:00", "12:00", "13:00", "19:00")).build());
        assertThat(day.getOvertimeMinutes()).isEqualTo(120);
        assertThat(day.getHourBankMinutes()).isZero();
    }

    @Test
    void limitesDaCltSaoSinalizados() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().record(record("07:00", "12:00", "12:30", "18:30")).build());
        assertThat(day.getWorkedMinutes()).isEqualTo(11 * 60);
        assertThat(day.getAlerts()).contains(
                AttendanceAlertEnum.OVER_10_HOURS,
                AttendanceAlertEnum.SHORT_BREAK,
                AttendanceAlertEnum.OVERTIME_OVER_2_HOURS);
    }

    @Test
    void semIntervaloEMaisDeSeisHorasContinuas() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().record(record("08:00", null, null, "16:00")).build());
        assertThat(day.getAlerts()).contains(AttendanceAlertEnum.NO_BREAK, AttendanceAlertEnum.OVER_6_HOURS_WITHOUT_BREAK);
    }

    @Test
    void interjornadaMenorQueOnzeHoras() {
        AttendanceRecord previous = record("13:00", "17:00", "18:00", "23:00");
        previous.setWorkDate(DAY.minusDays(1));
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().previousRecord(previous).record(record("08:00", "12:00", "13:00", "17:00")).build());
        assertThat(day.getRestBeforeMinutes()).isEqualTo(9 * 60);
        assertThat(day.getAlerts()).contains(AttendanceAlertEnum.SHORT_INTERJOURNEY);
    }

    @Test
    void diaPassadoSemSaidaFicaIncompleto() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().record(record("08:00", "12:00", null, null)).build());
        assertThat(day.getStatus()).isEqualTo(AttendanceDayStatusEnum.INCOMPLETE);
        assertThat(day.isPending()).isTrue();
    }

    @Test
    void diaUtilPassadoSemMarcacaoEFaltaComDebito() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(input().build());
        assertThat(day.getStatus()).isEqualTo(AttendanceDayStatusEnum.MISSING);
        assertThat(day.getHourBankMinutes()).isEqualTo(-480);
        assertThat(day.isAbsence()).isTrue();
    }

    @Test
    void feriasEAfastamentoNaoGeramSaldo() {
        assertThat(AttendanceDayEvaluator.evaluate(input().vacation(true).build()).getStatus())
                .isEqualTo(AttendanceDayStatusEnum.VACATION);
        AttendanceDayEvaluation leave = AttendanceDayEvaluator.evaluate(input().justifiedLeave(true).build());
        assertThat(leave.getStatus()).isEqualTo(AttendanceDayStatusEnum.LEAVE);
        assertThat(leave.getHourBankMinutes()).isZero();
    }

    @Test
    void trabalhoNoFeriadoViraCreditoInteiro() {
        AttendanceDayEvaluation day = AttendanceDayEvaluator.evaluate(
                input().holiday(true).record(record("08:00", "12:00", "13:00", "14:00")).build());
        assertThat(day.getStatus()).isEqualTo(AttendanceDayStatusEnum.HOLIDAY);
        assertThat(day.getHourBankMinutes()).isEqualTo(300);
    }

    @Test
    void formatoDeSaldo() {
        assertThat(AttendanceTimeFormat.signed(503)).isEqualTo("+08h23");
        assertThat(AttendanceTimeFormat.signed(-503)).isEqualTo("-08h23");
        assertThat(AttendanceTimeFormat.signed(0)).isEqualTo("00h00");
    }
}
