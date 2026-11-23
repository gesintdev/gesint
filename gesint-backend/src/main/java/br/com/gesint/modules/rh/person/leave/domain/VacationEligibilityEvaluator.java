package br.com.gesint.modules.rh.person.leave.domain;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gesint.modules.rh.person.leave.entity.LeaveTypeEnum;
import br.com.gesint.modules.rh.person.leave.entity.VacationReviewStatusEnum;

public final class VacationEligibilityEvaluator {

    private static final DateTimeFormatter DATE_BR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int MAX_PERIODS = 40;

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
                String status =
                        VacationRules.isConcessiveExpired(concessive.end(), referenceDate) ? "EXPIRED" : "CONCESSIVE";
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

    /**
     * Motivo, em português, de a pessoa não ter período elegível.
     * Usa as mesmas regras de {@link #findFirstEligiblePeriod}.
     */
    public static String describeWhyAbsent(
            LocalDate hireDate, LocalDate referenceDate, List<LeaveRequest> leaves) {
        if (hireDate == null) {
            return "não há data de admissão nem início de contrato para calcular o período aquisitivo.";
        }
        if (referenceDate == null || hireDate.isAfter(referenceDate)) {
            return "a admissão está marcada para "
                    + format(hireDate)
                    + ", ainda no futuro. A lista só inclui quem já começou.";
        }
        List<LeaveRequest> safeLeaves = leaves != null ? leaves : List.of();
        for (int periodIndex = 0; periodIndex < MAX_PERIODS; periodIndex++) {
            VacationRules.DateRange acquisition = VacationRules.acquisitionPeriod(hireDate, periodIndex);
            if (!referenceDate.isAfter(acquisition.end())) {
                return "o período aquisitivo de "
                        + format(acquisition.start())
                        + " a "
                        + format(acquisition.end())
                        + " ainda não terminou. A lista só inclui quem já completou esses 12 meses.";
            }
            VacationRules.DateRange concessive = VacationRules.concessivePeriod(acquisition.end());
            VacationAbsenceCalculator.Summary absences =
                    VacationAbsenceCalculator.summarize(safeLeaves, acquisition.start(), acquisition.end());
            int entitledDays = VacationRules.vacationDaysEntitled(absences.unjustifiedAbsences());
            VacationRules.DateRange next = VacationRules.acquisitionPeriod(hireDate, periodIndex + 1);
            boolean nextStillOpen = !referenceDate.isAfter(next.end());
            if (entitledDays <= 0) {
                if (nextStillOpen) {
                    return "no período aquisitivo de "
                            + format(acquisition.start())
                            + " a "
                            + format(acquisition.end())
                            + " houve "
                            + absences.unjustifiedAbsences()
                            + " faltas injustificadas, o que zera o direito a férias. O período seguinte só termina em "
                            + format(next.end())
                            + ".";
                }
                continue;
            }
            if (hasBlockingRequest(safeLeaves, acquisition, concessive)) {
                if (nextStillOpen) {
                    String deadline = VacationRules.isConcessiveExpired(concessive.end(), referenceDate)
                            ? " Esse prazo de gozo já venceu em " + format(concessive.end()) + "."
                            : " O gozo iria até " + format(concessive.end()) + ".";
                    return "já existe solicitação de férias em aberto ou aprovada para o período aquisitivo de "
                            + format(acquisition.start())
                            + " a "
                            + format(acquisition.end())
                            + "."
                            + deadline
                            + " Enquanto ela estiver em aberto ou aprovada, não surge outra linha desse período.";
                }
                continue;
            }
        }
        return "não há período de férias em aberto na data de hoje.";
    }

    private static String format(LocalDate date) {
        return date != null ? DATE_BR.format(date) : "—";
    }

    private static boolean hasBlockingRequest(
            List<LeaveRequest> leaves, VacationRules.DateRange acquisition, VacationRules.DateRange concessive) {
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
            LeaveRequest leave, VacationRules.DateRange acquisition, VacationRules.DateRange concessive) {
        if (leave.getAcquisitionPeriodStart() != null) {
            return leave.getAcquisitionPeriodStart().equals(acquisition.start());
        }
        LocalDate vacationStart = leave.getStartDate();
        return vacationStart != null
                && !vacationStart.isBefore(concessive.start())
                && !vacationStart.isAfter(concessive.end());
    }
}
