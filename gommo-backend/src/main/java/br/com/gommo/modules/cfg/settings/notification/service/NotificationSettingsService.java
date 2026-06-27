package br.com.gommo.modules.cfg.settings.notification.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.notification.dto.NotificationSettingsRequestDto;
import br.com.gommo.modules.cfg.settings.notification.dto.NotificationSettingsResponseDto;
import br.com.gommo.modules.cfg.settings.notification.entity.SystemSetting;
import br.com.gommo.modules.cfg.settings.notification.repository.SystemSettingRepository;

@Service
public class NotificationSettingsService {

    public static final String VACATION_DUE_NOTICE_DAYS = "VACATION_DUE_NOTICE_DAYS";
    private static final int DEFAULT_VACATION_DUE_NOTICE_DAYS = 30;

    private final SystemSettingRepository repository;

    public NotificationSettingsService(SystemSettingRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('notification:read')")
    public NotificationSettingsResponseDto getSettings() {
        return NotificationSettingsResponseDto.builder()
                .vacationDueNoticeDays(getVacationDueNoticeDays())
                .build();
    }

    @Transactional
    @PreAuthorize("hasAuthority('notification:write')")
    public NotificationSettingsResponseDto updateSettings(NotificationSettingsRequestDto request) {
        SystemSetting setting = repository
                .findBySettingKeyAndStatusNot(VACATION_DUE_NOTICE_DAYS, StatusEnum.DELETED)
                .orElseGet(() -> SystemSetting.builder()
                        .settingKey(VACATION_DUE_NOTICE_DAYS)
                        .description("Antecedencia, em dias, para notificacao de ferias a vencer")
                        .status(StatusEnum.ACTIVE)
                        .build());
        setting.setSettingValue(String.valueOf(request.getVacationDueNoticeDays()));
        repository.save(setting);
        return NotificationSettingsResponseDto.builder()
                .vacationDueNoticeDays(request.getVacationDueNoticeDays())
                .build();
    }

    @Transactional(readOnly = true)
    public int getVacationDueNoticeDays() {
        return repository
                .findBySettingKeyAndStatusNot(VACATION_DUE_NOTICE_DAYS, StatusEnum.DELETED)
                .map(SystemSetting::getSettingValue)
                .map(this::parsePositiveInt)
                .orElse(DEFAULT_VACATION_DUE_NOTICE_DAYS);
    }

    private int parsePositiveInt(String value) {
        try {
            int parsed = Integer.parseInt(value);
            return parsed > 0 ? parsed : DEFAULT_VACATION_DUE_NOTICE_DAYS;
        } catch (NumberFormatException ex) {
            return DEFAULT_VACATION_DUE_NOTICE_DAYS;
        }
    }
}
