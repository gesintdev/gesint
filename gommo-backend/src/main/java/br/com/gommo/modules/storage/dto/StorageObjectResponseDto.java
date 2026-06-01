package br.com.gommo.modules.storage.dto;

import br.com.gommo.core.entity.StatusEnum;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StorageObjectResponseDto {

    private final UUID id;
    private final Integer code;
    private final StatusEnum status;
    private final String bucket;
    private final String objectKey;
    private final String versionId;
    private final Boolean isLatest;
    private final String contentType;
    private final Long contentLength;
    private final String etag;
    private final String storageClass;
    private final String sha256Hex;
    private final Map<String, Object> metadata;
    private final OffsetDateTime createdAt;
    private final OffsetDateTime updatedAt;
}
