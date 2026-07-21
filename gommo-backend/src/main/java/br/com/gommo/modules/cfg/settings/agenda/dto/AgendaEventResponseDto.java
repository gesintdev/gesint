package br.com.gommo.modules.cfg.settings.agenda.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class AgendaEventResponseDto {
    private final UUID id;
    private final Integer code;
    private final String status;
    private final UUID ownerUserId;
    private final String title;
    private final OffsetDateTime startsAt;
    private final OffsetDateTime endsAt;
    private final String location;
    private final String description;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
