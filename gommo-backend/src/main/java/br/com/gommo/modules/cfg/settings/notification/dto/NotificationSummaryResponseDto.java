package br.com.gommo.modules.cfg.settings.notification.dto;

import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationSummaryResponseDto {
    private final long unreadCount;
    private final List<SystemNotificationResponseDto> notifications;
}
