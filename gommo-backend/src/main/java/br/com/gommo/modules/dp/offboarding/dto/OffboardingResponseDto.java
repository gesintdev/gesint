package br.com.gommo.modules.dp.offboarding.dto;

import lombok.*;

import java.time.*;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.dp.offboarding.entity.DismissalTypeEnum;

@Getter
@Builder
public class OffboardingResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID collaboratorId;
    private final String collaboratorName;
    private final LocalDate dismissalDate;
    private final DismissalTypeEnum dismissalType;
    private final String dismissalNotes;
    private final String homologationNotes;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
