package br.com.gommo.modules.rh.person.leave.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;

class LeaveAbsenceRulesTest {

    @Test
    void calculatesInclusiveDuration() {
        int days = LeaveAbsenceRules.inclusiveDays(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 15));

        assertThat(days).isEqualTo(15);
    }

    @Test
    void flagsInssWhenDurationExceedsFifteenDays() {
        boolean requiresInss = LeaveAbsenceRules.requiresInss(16, 16, LeaveAbsenceStatusEnum.VALIDATED, false);

        assertThat(requiresInss).isTrue();
    }

    @Test
    void keepsValidMedicalCertificateOutOfHourBankAndPayrollDiscount() {
        assertThat(LeaveAbsenceRules.occurrenceType(LeaveTypeEnum.MEDICAL_CERTIFICATE))
                .isEqualTo(AttendanceOccurrenceTypeEnum.MEDICAL_CERTIFICATE);
        assertThat(LeaveAbsenceRules.impactsHourBank(LeaveTypeEnum.MEDICAL_CERTIFICATE))
                .isFalse();
        assertThat(LeaveAbsenceRules.impactsPayroll(LeaveTypeEnum.MEDICAL_CERTIFICATE))
                .isFalse();
    }

    @Test
    void keepsUnjustifiedAbsenceImpactingHourBankAndPayroll() {
        assertThat(LeaveAbsenceRules.occurrenceType(LeaveTypeEnum.UNJUSTIFIED_ABSENCE))
                .isEqualTo(AttendanceOccurrenceTypeEnum.UNJUSTIFIED_ABSENCE);
        assertThat(LeaveAbsenceRules.impactsHourBank(LeaveTypeEnum.UNJUSTIFIED_ABSENCE))
                .isTrue();
        assertThat(LeaveAbsenceRules.impactsPayroll(LeaveTypeEnum.UNJUSTIFIED_ABSENCE))
                .isTrue();
    }

    @Test
    void derivesApprovedFlagFromAbsenceStatus() {
        assertThat(LeaveAbsenceRules.isApprovedAbsenceStatus(LeaveAbsenceStatusEnum.PENDING))
                .isFalse();
        assertThat(LeaveAbsenceRules.isApprovedAbsenceStatus(LeaveAbsenceStatusEnum.VALIDATED))
                .isTrue();
        assertThat(LeaveAbsenceRules.isApprovedAbsenceStatus(LeaveAbsenceStatusEnum.CANCELLED))
                .isFalse();
    }
}
