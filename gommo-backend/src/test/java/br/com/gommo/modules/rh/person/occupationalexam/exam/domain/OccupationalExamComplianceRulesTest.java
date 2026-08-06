package br.com.gommo.modules.rh.person.occupationalexam.exam.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.occupationalexam.exam.domain.OccupationalExamComplianceRules.DismissalWaiverDecision;

class OccupationalExamComplianceRulesTest {

    @Test
    void calculatesDueDateFromMatrixPeriodicity() {
        LocalDate due = OccupationalExamComplianceRules.calculateDueDate(LocalDate.of(2026, 1, 15), 12);

        assertThat(due).isEqualTo(LocalDate.of(2027, 1, 15));
        assertThat(OccupationalExamComplianceRules.calculateDueDate(LocalDate.of(2026, 1, 15), null))
                .isNull();
    }

    @Test
    void requiresReturnExamForMedicalLeaveOfThirtyDaysOrMore() {
        assertThat(OccupationalExamComplianceRules.isReturnExamRequired(30, LeaveTypeEnum.MEDICAL_CERTIFICATE))
                .isTrue();
        assertThat(OccupationalExamComplianceRules.isReturnExamRequired(29, LeaveTypeEnum.MEDICAL_CERTIFICATE))
                .isFalse();
        assertThat(OccupationalExamComplianceRules.isReturnExamRequired(40, LeaveTypeEnum.VACATION))
                .isFalse();
        assertThat(OccupationalExamComplianceRules.isReturnExamRequired(40, LeaveTypeEnum.OCCUPATIONAL_ACCIDENT))
                .isTrue();
    }

    @Test
    void detectsMissingComplementaryExamsOnPositionChange() {
        assertThat(OccupationalExamComplianceRules.positionChangeRequiresExam(List.of("01", "14"), List.of("01")))
                .isTrue();
        assertThat(OccupationalExamComplianceRules.positionChangeRequiresExam(List.of("01", "14"), List.of("01", "14")))
                .isFalse();
        assertThat(OccupationalExamComplianceRules.positionChangeRequiresExam(List.of(), List.of("01")))
                .isFalse();
    }

    @Test
    void waivesDismissalExamWithin135DaysForRiskGradeTwo() {
        DismissalWaiverDecision decision = OccupationalExamComplianceRules.evaluateDismissalWaiver(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 4, 1), 2, false);

        assertThat(decision.waived()).isTrue();
        assertThat(decision.reason()).contains("NR-7, item 7.4.3.5");
        assertThat(decision.reason()).contains("135");
    }

    @Test
    void requiresDismissalExamAfter90DaysForRiskGradeThree() {
        DismissalWaiverDecision decision = OccupationalExamComplianceRules.evaluateDismissalWaiver(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 5, 1), 3, false);

        assertThat(decision.waived()).isFalse();
    }

    @Test
    void neverWaivesWhenCriticalAgentExposure() {
        DismissalWaiverDecision decision = OccupationalExamComplianceRules.evaluateDismissalWaiver(
                LocalDate.of(2026, 7, 1), LocalDate.of(2026, 7, 10), 1, true);

        assertThat(decision.waived()).isFalse();
        assertThat(decision.reason()).contains("agente critico");
    }

    @Test
    void dismissalDueDateIsTenDaysAfterTermination() {
        assertThat(OccupationalExamComplianceRules.dismissalExamDueDate(LocalDate.of(2026, 8, 1)))
                .isEqualTo(LocalDate.of(2026, 8, 11));
    }
}
