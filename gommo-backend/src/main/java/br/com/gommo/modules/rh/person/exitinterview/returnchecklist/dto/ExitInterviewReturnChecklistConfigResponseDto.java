package br.com.gommo.modules.rh.person.exitinterview.returnchecklist.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class ExitInterviewReturnChecklistConfigResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String itemKey;
    private final String description;
    private final Integer displayOrder;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
