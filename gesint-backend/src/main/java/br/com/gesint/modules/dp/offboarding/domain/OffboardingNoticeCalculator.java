package br.com.gesint.modules.dp.offboarding.domain;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import br.com.gesint.modules.dp.offboarding.entity.DismissalTypeEnum;
import br.com.gesint.modules.dp.offboarding.entity.NoticeTypeEnum;

public final class OffboardingNoticeCalculator {

    private OffboardingNoticeCalculator() {}

    public record NoticeComputation(
            NoticeTypeEnum noticeType,
            int noticeDays,
            LocalDate noticeStartDate,
            LocalDate noticeEndDate,
            boolean workloadReductionApplicable) {}

    public static NoticeComputation compute(
            DismissalTypeEnum dismissalType,
            NoticeTypeEnum requestedType,
            LocalDate lastWorkDay,
            LocalDate contractStartDate) {
        LocalDate end = lastWorkDay != null ? lastWorkDay : LocalDate.now();
        if (dismissalType == DismissalTypeEnum.RESIGNATION) {
            LocalDate start = end.minusDays(29);
            return new NoticeComputation(
                    requestedType != null ? requestedType : NoticeTypeEnum.WORKED_BY_EMPLOYEE,
                    30,
                    start,
                    end,
                    false);
        }
        if (dismissalType == DismissalTypeEnum.WITHOUT_CAUSE) {
            int years = 0;
            if (contractStartDate != null && !contractStartDate.isAfter(end)) {
                years = (int) ChronoUnit.YEARS.between(contractStartDate, end);
            }
            int days = Math.min(90, 30 + (3 * Math.max(0, years)));
            LocalDate start = end.minusDays(Math.max(0, days - 1L));
            NoticeTypeEnum type = requestedType != null ? requestedType : NoticeTypeEnum.WORKED_BY_EMPLOYER;
            boolean reduction = type == NoticeTypeEnum.WORKED_BY_EMPLOYER;
            return new NoticeComputation(type, days, start, end, reduction);
        }
        if (dismissalType == DismissalTypeEnum.END_OF_CONTRACT
                || dismissalType == DismissalTypeEnum.WITH_CAUSE
                || dismissalType == DismissalTypeEnum.OTHER) {
            return new NoticeComputation(NoticeTypeEnum.NOT_APPLICABLE, 0, null, null, false);
        }
        // AGREEMENT etc.
        NoticeTypeEnum type = requestedType != null ? requestedType : NoticeTypeEnum.INDEMNIFIED;
        return new NoticeComputation(type, 0, null, null, false);
    }
}
