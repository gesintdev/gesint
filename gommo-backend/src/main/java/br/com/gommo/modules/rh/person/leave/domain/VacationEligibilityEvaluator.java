package br.com.gommo.modules.rh.person.leave.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.VacationReviewStatusEnum;

public final class VacationEligibilityEvaluator {

    private VacationEligibilityEvaluator() {}

    public record EligiblePeriod(
            int periodIndex,
            VacationRules.DateRange acquisition,
            VacationRules.DateRange concessive,
            String status,
            int entitledDays,
            int unjustifiedAbsences,
            int justifiedAbsences) {}

    public static Optional<EligiblePeriod> findFirstEligiblePeriod(
            LocalDate hireDate, LocalDate referenceDate, List<LeaveRequest> leaves) {
        if (hireDate == null || referenceDate == null || hireDate.isAfter(referenceDate)) {
            return Optional.empty();
        }

        List<LeaveRequest> safeLeaves = leaves != null ? leaves : List.of();
        for (int periodIndex = 0; ; periodIndex++) {
            VacationRules.DateRange acquisition = VacationRules.acquisitionPeriod(hireDate, periodIndex);
            if (!referenceDate.isAfter(acquisition.end())) {
                return Optional.empty();
            }

            VacationRules.DateRange concessive = VacationRules.concessivePeriod(acquisition.end());
            VacationAbsenceCalculator.Summary absences =
                    VacationAbsenceCalculator.summarize(safeLeaves, acquisition.start(), acquisition.end());
            int entitledDays = VacationRules.vacationDaysEntitled(absences.unjustifiedAbsences());

            if (entitledDays > 0 && !hasBlockingRequest(safeLeaves, acquisition, concessive)) {
                String status = VacationRules.isConcessiveExpired(concessive.end(), referenceDate)
                        ? "EXPIRED"
                        : "CONCESSIVE";
                return Optional.of(new EligiblePeriod(
                        periodIndex,
                        acquisition,
                        concessive,
                        status,
                        entitledDays,
                        absences.unjustifiedAbsences(),
                        absences.justifiedAbsences()));
            }
        }
    }

    private static boolean hasBlockingRequest(
            List<LeaveRequest> leaves,
            VacationRules.DateRange acquisition,
            VacationRules.DateRange concessive) {
        return leaves.stream()
                .filter(VacationEligibilityEvaluator::isOpenOrConfirmedVacation)
                .anyMatch(leave -> belongsToPeriod(leave, acquisition, concessive));
    }

    private static boolean isOpenOrConfirmedVacation(LeaveRequest leave) {
        if (leave.getStatus() == StatusEnum.DELETED || leave.getLeaveType() != LeaveTypeEnum.VACATION) {
            return false;
        }
        return Boolean.TRUE.equals(leave.getApproved())
                || leave.getReviewStatus() == VacationReviewStatusEnum.PENDING
                || leave.getReviewStatus() == VacationReviewStatusEnum.APPROVED;
    }

    private static boolean belongsToPeriod(
            LeaveRequest leave,
            VacationRules.DateRange acquisition,
            VacationRules.DateRange concessive) {
        if (leave.getAcquisitionPeriodStart() != null) {
            return leave.getAcquisitionPeriodStart().equals(acquisition.start());
        }
        LocalDate vacationStart = leave.getStartDate();
        return vacationStart != null
                && !vacationStart.isBefore(concessive.start())
                && !vacationStart.isAfter(concessive.end());
    }
}
