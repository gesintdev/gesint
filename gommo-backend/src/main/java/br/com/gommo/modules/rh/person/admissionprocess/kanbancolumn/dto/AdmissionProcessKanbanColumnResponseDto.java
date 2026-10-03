package br.com.gommo.modules.rh.person.admissionprocess.kanbancolumn.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

@Getter
@Builder
public class AdmissionProcessKanbanColumnResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String columnKey;
    private final String name;
    private final String color;
    private final Integer displayOrder;
    private final boolean systemColumn;
    private final boolean slaEnabled;
    private final Integer slaBusinessDays;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
