package br.com.gommo.modules.rh.person.leave.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.VacationReviewStatusEnum;

class VacationEligibilityEvaluatorTest {

    private static final LocalDate REFERENCE_DATE = LocalDate.of(2026, 6, 17);

    @Test
    void returnsOldestAcquiredPeriodIncludingExpiredPeriods() {
        var result = VacationEligibilityEvaluator.findFirstEligiblePeriod(
                LocalDate.of(2024, 6, 17), REFERENCE_DATE, List.of());

        assertThat(result).isPresent();
        assertThat(result.orElseThrow().periodIndex()).isZero();
        assertThat(result.orElseThrow().status()).isEqualTo("EXPIRED");
        assertThat(result.orElseThrow().acquisition().start()).isEqualTo(LocalDate.of(2024, 6, 17));
        assertThat(result.orElseThrow().entitledDays()).isEqualTo(30);
    }

    @Test
    void advancesToNextAcquiredPeriodWhenPreviousOneIsConfirmed() {
        LeaveRequest confirmed = vacation(
                LocalDate.of(2024, 6, 17),
                LocalDate.of(2025, 7, 1),
                true,
                VacationReviewStatusEnum.APPROVED);

        var result = VacationEligibilityEvaluator.findFirstEligiblePeriod(
                LocalDate.of(2024, 6, 17), REFERENCE_DATE, List.of(confirmed));

        assertThat(result).isPresent();
        assertThat(result.orElseThrow().periodIndex()).isEqualTo(1);
        assertThat(result.orElseThrow().status()).isEqualTo("CONCESSIVE");
        assertThat(result.orElseThrow().acquisition().start()).isEqualTo(LocalDate.of(2025, 6, 17));
    }

    @Test
    void hidesCollaboratorWhenOnlyAcquiredPeriodHasPendingRequest() {
        LeaveRequest pending = vacation(
                LocalDate.of(2025, 6, 17),
                LocalDate.of(2026, 7, 1),
                false,
                VacationReviewStatusEnum.PENDING);

        var result = VacationEligibilityEvaluator.findFirstEligiblePeriod(
                LocalDate.of(2025, 6, 17), REFERENCE_DATE, List.of(pending));

        assertThat(result).isEmpty();
    }

    @Test
    void rejectedRequestDoesNotBlockANewRequestForTheSamePeriod() {
        LeaveRequest rejected = vacation(
                LocalDate.of(2025, 6, 17),
                LocalDate.of(2026, 7, 1),
                false,
                VacationReviewStatusEnum.REJECTED);

        var result = VacationEligibilityEvaluator.findFirstEligiblePeriod(
                LocalDate.of(2025, 6, 17), REFERENCE_DATE, List.of(rejected));

        assertThat(result).isPresent();
        assertThat(result.orElseThrow().periodIndex()).isZero();
    }

    @Test
    void skipsPeriodWithoutEntitlementAndReturnsNextAcquiredPeriod() {
        LeaveRequest unpaidAbsence = LeaveRequest.builder()
                .status(StatusEnum.ACTIVE)
                .leaveType(LeaveTypeEnum.UNPAID)
                .approved(true)
                .startDate(LocalDate.of(2024, 7, 1))
                .endDate(LocalDate.of(2024, 8, 2))
                .build();

        var result = VacationEligibilityEvaluator.findFirstEligiblePeriod(
                LocalDate.of(2024, 6, 17), REFERENCE_DATE, List.of(unpaidAbsence));

        assertThat(result).isPresent();
        assertThat(result.orElseThrow().periodIndex()).isEqualTo(1);
        assertThat(result.orElseThrow().entitledDays()).isEqualTo(30);
    }

    @Test
    void doesNotReturnPeriodStillBeingAcquired() {
        var result = VacationEligibilityEvaluator.findFirstEligiblePeriod(
                LocalDate.of(2025, 6, 18), REFERENCE_DATE, List.of());

        assertThat(result).isEmpty();
    }

    private static LeaveRequest vacation(
            LocalDate acquisitionStart,
            LocalDate vacationStart,
            boolean approved,
            VacationReviewStatusEnum reviewStatus) {
        return LeaveRequest.builder()
                .status(StatusEnum.ACTIVE)
                .leaveType(LeaveTypeEnum.VACATION)
                .approved(approved)
                .reviewStatus(reviewStatus)
                .acquisitionPeriodStart(acquisitionStart)
                .startDate(vacationStart)
                .endDate(vacationStart.plusDays(29))
                .build();
    }
}
