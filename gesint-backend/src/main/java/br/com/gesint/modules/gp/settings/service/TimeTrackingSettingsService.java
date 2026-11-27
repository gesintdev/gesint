package br.com.gesint.modules.gp.settings.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.settings.notification.entity.SystemSetting;
import br.com.gesint.modules.cfg.settings.notification.repository.SystemSettingRepository;
import br.com.gesint.modules.gp.settings.dto.TimeTrackingSettings;

/**
 * Le e grava as preferencias da Gestao de Ponto. Sem @PreAuthorize: quem expoe na API
 * (AttendanceRecordService.getSettings/updateSettings) e quem autoriza.
 */
@Service
public class TimeTrackingSettingsService {

    public static final String REQUIRE_PHOTO = "ATTENDANCE_REQUIRE_PHOTO";
    public static final String REQUIRE_LOCATION = "ATTENDANCE_REQUIRE_LOCATION";
    public static final String TOLERANCE_MINUTES = "ATTENDANCE_TOLERANCE_MINUTES";
    public static final String HOUR_BANK_ENABLED = "ATTENDANCE_HOUR_BANK_ENABLED";
    public static final String OVERTIME_ENABLED = "ATTENDANCE_OVERTIME_ENABLED";
    public static final String HOUR_BANK_START = "ATTENDANCE_HOUR_BANK_START";
    public static final String NOTIFY_COLLABORATOR = "ATTENDANCE_NOTIFY_COLLABORATOR";
    public static final String NOTIFY_HR = "ATTENDANCE_NOTIFY_HR";
    public static final String NOTIFY_NEAR_LIMITS = "ATTENDANCE_NOTIFY_NEAR_LIMITS";
    public static final String EMAIL_COLLABORATOR = "ATTENDANCE_EMAIL_COLLABORATOR";
    public static final String EMAIL_HR_DIGEST = "ATTENDANCE_EMAIL_HR_DIGEST";
    public static final String HR_DIGEST_RECIPIENTS = "ATTENDANCE_HR_DIGEST_RECIPIENTS";

    public static final int DEFAULT_TOLERANCE_MINUTES = 10;
    public static final int MAX_TOLERANCE_MINUTES = 60;

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Sao_Paulo");

    private final SystemSettingRepository settingRepository;

    public TimeTrackingSettingsService(SystemSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Transactional(readOnly = true)
    public TimeTrackingSettings current() {
        return TimeTrackingSettings.builder()
                .requirePhoto(bool(REQUIRE_PHOTO, true))
                .requireLocation(bool(REQUIRE_LOCATION, true))
                .toleranceMinutes(clampTolerance(integer(TOLERANCE_MINUTES, DEFAULT_TOLERANCE_MINUTES)))
                .hourBankEnabled(bool(HOUR_BANK_ENABLED, true))
                .overtimeEnabled(bool(OVERTIME_ENABLED, false))
                .hourBankStartDate(date(HOUR_BANK_START, LocalDate.now(BUSINESS_ZONE).withDayOfYear(1)))
                .notifyCollaborator(bool(NOTIFY_COLLABORATOR, true))
                .notifyHr(bool(NOTIFY_HR, true))
                .notifyNearLimits(bool(NOTIFY_NEAR_LIMITS, true))
                .emailCollaborator(bool(EMAIL_COLLABORATOR, false))
                .emailHrDigest(bool(EMAIL_HR_DIGEST, false))
                .hrDigestRecipients(text(HR_DIGEST_RECIPIENTS, ""))
                .build();
    }

    @Transactional
    public TimeTrackingSettings save(TimeTrackingSettings next) {
        upsert(REQUIRE_PHOTO, String.valueOf(next.isRequirePhoto()), "Exigir foto no registro de ponto");
        upsert(REQUIRE_LOCATION, String.valueOf(next.isRequireLocation()), "Exigir localizacao no registro de ponto");
        upsert(TOLERANCE_MINUTES, String.valueOf(clampTolerance(next.getToleranceMinutes())),
                "Tolerancia diaria em minutos (CLT art. 58 par. 1)");
        upsert(HOUR_BANK_ENABLED, String.valueOf(next.isHourBankEnabled()), "Empresa usa banco de horas");
        upsert(OVERTIME_ENABLED, String.valueOf(next.isOvertimeEnabled()), "Empresa paga horas extras");
        upsert(HOUR_BANK_START,
                next.getHourBankStartDate() != null ? next.getHourBankStartDate().toString() : "",
                "Inicio da apuracao do banco de horas");
        upsert(NOTIFY_COLLABORATOR, String.valueOf(next.isNotifyCollaborator()),
                "Avisar o colaborador sobre pendencias de ponto");
        upsert(NOTIFY_HR, String.valueOf(next.isNotifyHr()), "Avisar o RH sobre a saude do ponto");
        upsert(NOTIFY_NEAR_LIMITS, String.valueOf(next.isNotifyNearLimits()),
                "Avisar perto de 10 horas e de 6 horas sem intervalo");
        upsert(EMAIL_COLLABORATOR, String.valueOf(next.isEmailCollaborator()),
                "Enviar e-mail ao colaborador sobre pendencias");
        upsert(EMAIL_HR_DIGEST, String.valueOf(next.isEmailHrDigest()), "Enviar resumo diario do ponto por e-mail");
        upsert(HR_DIGEST_RECIPIENTS, normalizeRecipients(next.getHrDigestRecipients()),
                "Destinatarios do resumo diario do ponto");
        return current();
    }

    public static List<String> recipients(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split("[,;\\s]+"))
                .map(String::trim)
                .filter(value -> value.contains("@"))
                .map(value -> value.toLowerCase(Locale.ROOT))
                .distinct()
                .toList();
    }

    private static String normalizeRecipients(String raw) {
        return recipients(raw).stream().collect(Collectors.joining(", "));
    }

    private static int clampTolerance(int minutes) {
        return Math.max(0, Math.min(MAX_TOLERANCE_MINUTES, minutes));
    }

    private boolean bool(String key, boolean fallback) {
        String value = text(key, null);
        return value == null || value.isBlank() ? fallback : Boolean.parseBoolean(value.trim());
    }

    private int integer(String key, int fallback) {
        String value = text(key, null);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ex) {
            return fallback;
        }
    }

    private LocalDate date(String key, LocalDate fallback) {
        String value = text(key, null);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException ex) {
            return fallback;
        }
    }

    private String text(String key, String fallback) {
        return settingRepository.findBySettingKeyAndStatusNot(key, StatusEnum.DELETED)
                .map(SystemSetting::getSettingValue)
                .orElse(fallback);
    }

    private void upsert(String key, String value, String description) {
        SystemSetting setting = settingRepository.findBySettingKeyAndStatusNot(key, StatusEnum.DELETED)
                .orElseGet(() -> SystemSetting.builder()
                        .settingKey(key)
                        .description(description)
                        .status(StatusEnum.ACTIVE)
                        .build());
        setting.setSettingValue(value == null ? "" : value);
        settingRepository.save(setting);
    }
}
