package br.com.gesint.modules.gp.attendance.dto;

import java.time.LocalDate;

import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendanceSettingsResponseDto {
    private final boolean requirePhoto;
    private final boolean requireLocation;
    private final int toleranceMinutes;
    private final boolean hourBankEnabled;
    private final boolean overtimeEnabled;
    private final LocalDate hourBankStartDate;
    private final boolean notifyCollaborator;
    private final boolean notifyHr;
    private final boolean notifyNearLimits;
    private final boolean emailCollaborator;
    private final boolean emailHrDigest;
    private final String hrDigestRecipients;

    public static AttendanceSettingsResponseDto from(TimeTrackingSettings settings) {
        return AttendanceSettingsResponseDto.builder()
                .requirePhoto(settings.isRequirePhoto())
                .requireLocation(settings.isRequireLocation())
                .toleranceMinutes(settings.getToleranceMinutes())
                .hourBankEnabled(settings.isHourBankEnabled())
                .overtimeEnabled(settings.isOvertimeEnabled())
                .hourBankStartDate(settings.getHourBankStartDate())
                .notifyCollaborator(settings.isNotifyCollaborator())
                .notifyHr(settings.isNotifyHr())
                .notifyNearLimits(settings.isNotifyNearLimits())
                .emailCollaborator(settings.isEmailCollaborator())
                .emailHrDigest(settings.isEmailHrDigest())
                .hrDigestRecipients(settings.getHrDigestRecipients())
                .build();
    }
}
