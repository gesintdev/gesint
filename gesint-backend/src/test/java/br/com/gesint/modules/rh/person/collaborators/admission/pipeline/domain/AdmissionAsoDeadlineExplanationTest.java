package br.com.gesint.modules.rh.person.collaborators.admission.pipeline.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamLifecycleStatusEnum;
import br.com.gesint.modules.dp.occupationalexam.exam.entity.OccupationalExamResultEnum;

class AdmissionAsoDeadlineExplanationTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 11, 19);
    private static final LocalDate TOMORROW = LocalDate.of(2026, 11, 20);

    @Test
    void futureExamDatesDoNotClearAsoOverdueWhenStartDueDateAlreadyPassed() {
        String text = AdmissionAsoDeadlineExplanation.explain(snapshot(
                TODAY,
                TODAY,
                false,
                true,
                TOMORROW,
                TOMORROW,
                TOMORROW,
                TOMORROW,
                null,
                OccupationalExamLifecycleStatusEnum.PREVISTO));

        assertThat(text).contains("prazo vencido");
        assertThat(text).contains("18/11/2026");
        assertThat(text).contains("20/11/2026");
        assertThat(text).contains("não tira o atraso");
        assertThat(text).contains("Previsto");
        assertThat(text).contains("não informado");
    }

    @Test
    void fitRegisteredExamIsNotOverdueEvenIfStartAlreadyPassed() {
        String text = AdmissionAsoDeadlineExplanation.explain(snapshot(
                LocalDate.of(2026, 11, 1),
                TODAY,
                false,
                true,
                TOMORROW,
                TOMORROW,
                TOMORROW,
                TOMORROW,
                OccupationalExamResultEnum.FIT,
                OccupationalExamLifecycleStatusEnum.REGISTRADO));

        assertThat(text).contains("não fica em atraso");
        assertThat(text).contains("Registrado");
        assertThat(text).doesNotContain("não tira o atraso");
    }

    @Test
    void dueOnTodayIsNotYetOverdue() {
        String text = AdmissionAsoDeadlineExplanation.explain(snapshot(
                TOMORROW,
                TODAY,
                false,
                true,
                TOMORROW,
                null,
                null,
                null,
                null,
                OccupationalExamLifecycleStatusEnum.CONVOCADO));

        assertThat(text).contains("ainda não venceu");
        assertThat(text).contains("19/11/2026");
        assertThat(text).doesNotContain("não tira o atraso");
    }

    private static AdmissionAsoDeadlineExplanation.Snapshot snapshot(
            LocalDate expectedStart,
            LocalDate today,
            boolean skipped,
            boolean hasExam,
            LocalDate scheduled,
            LocalDate clinical,
            LocalDate issued,
            LocalDate validity,
            OccupationalExamResultEnum result,
            OccupationalExamLifecycleStatusEnum lifecycle) {
        return new AdmissionAsoDeadlineExplanation.Snapshot(
                "Ana",
                expectedStart,
                today,
                false,
                skipped,
                hasExam,
                scheduled,
                clinical,
                issued,
                validity,
                result,
                lifecycle);
    }
}
