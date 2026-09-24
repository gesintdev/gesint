package br.com.gommo.modules.cfg.settings.documenttype.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.cfg.settings.documenttype.entity.DocumentDataClassEnum;

@Getter
@Builder
public class DocumentTypeResponseDto {
    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String typeCode;
    private final String name;
    private final String description;
    private final DocumentDataClassEnum dataClass;
    private final List<String> contexts;
    private final Boolean systemManaged;
    private final Integer sortOrder;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
