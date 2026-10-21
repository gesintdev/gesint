package br.com.gesint.modules.cfg.settings.notification.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationSettingsResponseDto {
    private final Integer vacationDueNoticeDays;
}
