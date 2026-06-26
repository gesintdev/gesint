package br.com.gommo.modules.rh.person.leave.domain;

import br.com.gommo.modules.rh.person.attendance.entity.AttendanceOccurrenceTypeEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveAbsenceStatusEnum;
import br.com.gommo.modules.rh.person.leave.entity.LeaveTypeEnum;
import java.time.LocalDate;

public final class LeaveAbsenceRules {

    public static final int INSS_REFERRAL_DAY_LIMIT = 15;

    private LeaveAbsenceRules() {}

    public static int inclusiveDays(LocalDate startDate, LocalDate endDate) {
        return VacationRules.inclusiveDays(startDate, endDate);
    }

    public static boolean requiresInss(
            int durationDays, int relatedCertificateDays, LeaveAbsenceStatusEnum absenceStatus, boolean requested) {
        return requested
                || durationDays > INSS_REFERRAL_DAY_LIMIT
                || relatedCertificateDays > INSS_REFERRAL_DAY_LIMIT
                || absenceStatus == LeaveAbsenceStatusEnum.REFERRED_INSS
                || absenceStatus == LeaveAbsenceStatusEnum.APPROVED_INSS;
    }

    public static boolean isApprovedAbsenceStatus(LeaveAbsenceStatusEnum status) {
        return switch (status) {
            case VALIDATED, REFERRED_INSS, APPROVED_INSS, FINALIZED -> true;
            case PENDING, CANCELLED -> false;
        };
    }

    public static AttendanceOccurrenceTypeEnum occurrenceType(LeaveTypeEnum type) {
        return switch (type) {
            case MEDICAL_CERTIFICATE -> AttendanceOccurrenceTypeEnum.MEDICAL_CERTIFICATE;
            case UNJUSTIFIED_ABSENCE -> AttendanceOccurrenceTypeEnum.UNJUSTIFIED_ABSENCE;
            case VACATION -> AttendanceOccurrenceTypeEnum.VACATION;
            case MATERNITY,
                    PATERNITY,
                    BEREAVEMENT,
                    MARRIAGE,
                    BLOOD_DONATION,
                    ELECTORAL_SERVICE,
                    MILITARY_SERVICE,
                    JURY_DUTY,
                    UNION_REPRESENTATION -> AttendanceOccurrenceTypeEnum.LICENSE;
            default -> AttendanceOccurrenceTypeEnum.LEAVE_ABSENCE;
        };
    }

    public static boolean impactsHourBank(LeaveTypeEnum type) {
        return type == LeaveTypeEnum.UNJUSTIFIED_ABSENCE;
    }

    public static boolean impactsPayroll(LeaveTypeEnum type) {
        return switch (type) {
            case UNJUSTIFIED_ABSENCE, UNPAID, UNPAID_LEAVE, SUSPENSION, SICK_LEAVE_INSS -> true;
            default -> false;
        };
    }
}
