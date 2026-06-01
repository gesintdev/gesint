package br.com.gommo.modules.storage.dto;

import br.com.gommo.core.entity.StatusEnum;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StorageObjectLinkResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final UUID storageObjectId;
    private final String entityType;
    private final UUID entityId;
    private final String linkRole;
    private final String displayName;
    private final StorageObjectResponseDto storageObject;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
