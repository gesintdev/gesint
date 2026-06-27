package br.com.gommo.modules.rh.person.leave.domain;

import java.time.LocalDate;
import java.util.List;

import br.com.gommo.modules.rh.person.leave.entity.LeaveRequest;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;

public final class VacationAbsenceCalculator {

    public record Summary(int unjustifiedAbsences, int justifiedAbsences) {}

    private VacationAbsenceCalculator() {}

    public static Summary summarize(List<LeaveRequest> leaves, LocalDate periodStart, LocalDate periodEnd) {
        int unjustified = 0;
        int justified = 0;
        for (LeaveRequest leave : leaves) {
            if (leave.getLeaveType() == LeaveTypeEnum.VACATION) {
                continue;
            }
            if (!Boolean.TRUE.equals(leave.getApproved())) {
                continue;
            }
            int days = overlapInclusiveDays(leave.getStartDate(), leave.getEndDate(), periodStart, periodEnd);
            if (days <= 0) {
                continue;
            }
            switch (leave.getLeaveType()) {
                case UNJUSTIFIED_ABSENCE -> unjustified += days;
                case MEDICAL,
                        MEDICAL_CERTIFICATE,
                        SICK_LEAVE_INSS,
                        OCCUPATIONAL_ACCIDENT,
                        MATERNITY,
                        PATERNITY,
                        BEREAVEMENT,
                        MARRIAGE,
                        BLOOD_DONATION,
                        ELECTORAL_SERVICE,
                        MILITARY_SERVICE,
                        JURY_DUTY,
                        UNION_REPRESENTATION -> justified += days;
                default -> {
                    // Contract suspensions and generic leave types are handled outside vacation absence math.
                }
            }
        }
        return new Summary(unjustified, justified);
    }

    public static int overlapInclusiveDays(LocalDate aStart, LocalDate aEnd, LocalDate bStart, LocalDate bEnd) {
        LocalDate start = aStart.isAfter(bStart) ? aStart : bStart;
        LocalDate end = aEnd.isBefore(bEnd) ? aEnd : bEnd;
        if (end.isBefore(start)) {
            return 0;
        }
        return VacationRules.inclusiveDays(start, end);
    }
}
