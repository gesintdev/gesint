package br.com.gommo.modules.cfg.settings.notification.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SystemNotificationResponseDto {
    private final UUID id;
    private final Integer code;
    private final String notificationType;
    private final String title;
    private final String message;
    private final String referenceType;
    private final UUID referenceId;
    private final LocalDate referenceDueDate;
    private final OffsetDateTime readAt;
    private final OffsetDateTime createdAt;
}
