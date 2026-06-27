package br.com.gommo.modules.cfg.settings.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class NotificationSummaryResponseDto {
    private final long unreadCount;
    private final List<SystemNotificationResponseDto> notifications;
}
