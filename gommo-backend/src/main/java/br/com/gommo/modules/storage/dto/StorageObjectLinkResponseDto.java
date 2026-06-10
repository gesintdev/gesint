package br.com.gommo.modules.storage.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

import br.com.gommo.core.entity.StatusEnum;

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
    private final String documentType;
    private final StorageObjectResponseDto storageObject;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
