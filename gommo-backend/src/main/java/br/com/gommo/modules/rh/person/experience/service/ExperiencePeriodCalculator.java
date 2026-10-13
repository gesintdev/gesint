package br.com.gommo.modules.rh.person.experience.service;

import java.time.LocalDate;

import br.com.gommo.modules.rh.person.experience.entity.ExperiencePeriodEnum;

public final class ExperiencePeriodCalculator {
    private static final int MAX_DAYS = 90;

    private ExperiencePeriodCalculator() {}

    public static int initialMilestoneDays(ExperiencePeriodEnum period) {
        return switch (period) {
            case DAYS_30_60 -> 30;
            case DAYS_45_45 -> 45;
            case DAYS_90 -> 90;
            case NONE -> 0;
        };
    }

    public static int extensionDays(ExperiencePeriodEnum period) {
        return switch (period) {
            case DAYS_30_60 -> 30;
            case DAYS_45_45 -> 45;
            case DAYS_90, NONE -> 0;
        };
    }

    public static boolean canExtend(ExperiencePeriodEnum period, boolean extensionUsed) {
        if (extensionUsed || period == null || period == ExperiencePeriodEnum.NONE) {
            return false;
        }
        return extensionDays(period) > 0;
    }

    public static LocalDate dueDate(LocalDate startDate, int milestoneDays) {
        if (startDate == null || milestoneDays <= 0) {
            return startDate;
        }
        return startDate.plusDays(milestoneDays);
    }

    public static int cappedMilestone(int milestoneDays) {
        return Math.min(Math.max(milestoneDays, 0), MAX_DAYS);
    }

    public static int maxDays() {
        return MAX_DAYS;
    }
}
