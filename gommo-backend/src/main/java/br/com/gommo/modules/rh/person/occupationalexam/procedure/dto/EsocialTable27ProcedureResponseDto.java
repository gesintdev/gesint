package br.com.gommo.modules.rh.person.occupationalexam.procedure.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class EsocialTable27ProcedureResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String procedureCode;
    private final String description;
    private final Boolean active;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
