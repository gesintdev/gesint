package br.com.gommo.modules.rh.person.leave.domain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

/**
 * Regras de férias CLT (período aquisitivo/concessivo, fracionamento, abono pecuniário).
 */
public final class VacationRules {

    public static final int MAX_PECUNIARY_DAYS = 10;
    public static final int MAX_SPLIT_PERIODS = 3;
    public static final int MIN_MAIN_SPLIT_DAYS = 14;
    public static final int MIN_OTHER_SPLIT_DAYS = 5;

    private static final Set<LocalDate> NATIONAL_HOLIDAYS = Set.of(
            LocalDate.of(2025, 1, 1),
            LocalDate.of(2025, 4, 18),
            LocalDate.of(2025, 4, 21),
            LocalDate.of(2025, 5, 1),
            LocalDate.of(2025, 6, 19),
            LocalDate.of(2025, 9, 7),
            LocalDate.of(2025, 10, 12),
            LocalDate.of(2025, 11, 2),
            LocalDate.of(2025, 11, 15),
            LocalDate.of(2025, 11, 20),
            LocalDate.of(2025, 12, 25),
            LocalDate.of(2026, 1, 1),
            LocalDate.of(2026, 4, 3),
            LocalDate.of(2026, 4, 21),
            LocalDate.of(2026, 5, 1),
            LocalDate.of(2026, 6, 19),
            LocalDate.of(2026, 9, 7),
            LocalDate.of(2026, 10, 12),
            LocalDate.of(2026, 11, 2),
            LocalDate.of(2026, 11, 15),
            LocalDate.of(2026, 11, 20),
            LocalDate.of(2026, 12, 25),
            LocalDate.of(2027, 1, 1),
            LocalDate.of(2027, 3, 26),
            LocalDate.of(2027, 4, 21),
            LocalDate.of(2027, 5, 1),
            LocalDate.of(2027, 6, 19),
            LocalDate.of(2027, 9, 7),
            LocalDate.of(2027, 10, 12),
            LocalDate.of(2027, 11, 2),
            LocalDate.of(2027, 11, 15),
            LocalDate.of(2027, 11, 20),
            LocalDate.of(2027, 12, 25));

    private VacationRules() {}

    public record DateRange(LocalDate start, LocalDate end) {}

    public record SplitValidation(boolean valid, String message) {}

    public record PaymentEstimate(BigDecimal vacationPay, BigDecimal constitutionalThird, BigDecimal grossTotal) {}

    public static int inclusiveDays(LocalDate start, LocalDate end) {
        return (int) ChronoUnit.DAYS.between(start, end) + 1;
    }

    public static int vacationDaysEntitled(int unjustifiedAbsences) {
        if (unjustifiedAbsences <= 5) return 30;
        if (unjustifiedAbsences <= 14) return 24;
        if (unjustifiedAbsences <= 23) return 18;
        if (unjustifiedAbsences <= 32) return 12;
        return 0;
    }

    public static DateRange acquisitionPeriod(LocalDate hireDate, int periodIndex) {
        LocalDate start = hireDate.plusMonths(12L * periodIndex);
        LocalDate end = start.plusMonths(12).minusDays(1);
        return new DateRange(start, end);
    }

    public static DateRange concessivePeriod(LocalDate acquisitionEnd) {
        LocalDate start = acquisitionEnd.plusDays(1);
        LocalDate end = start.plusMonths(12).minusDays(1);
        return new DateRange(start, end);
    }

    public static boolean isConcessiveExpired(LocalDate concessiveEnd, LocalDate referenceDate) {
        return referenceDate.isAfter(concessiveEnd);
    }

    public static int maxPecuniaryDays(int entitledDays) {
        return Math.min(MAX_PECUNIARY_DAYS, entitledDays / 3);
    }

    public static SplitValidation validateSplit(List<Integer> periodDayCounts) {
        if (periodDayCounts == null || periodDayCounts.isEmpty()) {
            return new SplitValidation(false, "Informe ao menos um período de férias.");
        }
        if (periodDayCounts.size() > MAX_SPLIT_PERIODS) {
            return new SplitValidation(false, "É permitido fracionar em até 3 períodos.");
        }
        if (periodDayCounts.size() == 1) {
            return new SplitValidation(true, null);
        }
        boolean hasMain = periodDayCounts.stream().anyMatch(d -> d >= MIN_MAIN_SPLIT_DAYS);
        boolean allOthersValid = periodDayCounts.stream().allMatch(d -> d >= MIN_OTHER_SPLIT_DAYS);
        if (!hasMain || !allOthersValid) {
            return new SplitValidation(
                    false,
                    "No fracionamento, um período deve ter no mínimo 14 dias corridos e os demais, no mínimo 5 dias cada.");
        }
        return new SplitValidation(true, null);
    }

    /** Vedado iniciar férias nos 2 dias que antecedem domingo (DSR) ou feriado (CLT). */
    public static boolean isRestrictedVacationStart(LocalDate startDate) {
        for (int i = 1; i <= 2; i++) {
            LocalDate followingRestOrHoliday = startDate.plusDays(i);
            if (isWeeklyRestDay(followingRestOrHoliday) || NATIONAL_HOLIDAYS.contains(followingRestOrHoliday)) {
                return true;
            }
        }
        return false;
    }

    public static LocalDate paymentDeadline(LocalDate vacationStart) {
        return vacationStart.minusDays(2);
    }

    public static PaymentEstimate estimatePayment(BigDecimal baseSalary, int vacationDaysUsed, int pecuniaryDays) {
        if (baseSalary == null || baseSalary.signum() <= 0) {
            return new PaymentEstimate(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }
        BigDecimal daily = baseSalary.divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP);
        int totalRemuneratedDays = vacationDaysUsed + pecuniaryDays;
        BigDecimal vacationPay =
                daily.multiply(BigDecimal.valueOf(totalRemuneratedDays)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal third = vacationPay.divide(BigDecimal.valueOf(3), 2, RoundingMode.HALF_UP);
        return new PaymentEstimate(vacationPay, third, vacationPay.add(third));
    }

    private static boolean isWeeklyRestDay(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }
}
