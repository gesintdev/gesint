package br.com.gommo.modules.storage.mapper;

import br.com.gommo.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;
import br.com.gommo.modules.storage.entity.StorageObject;
import br.com.gommo.modules.storage.entity.StorageObjectLink;
import org.springframework.stereotype.Component;

@Component
public class StorageMapper {

    public StorageObjectResponseDto toObjectResponse(StorageObject entity) {
        return StorageObjectResponseDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .status(entity.getStatus())
                .bucket(entity.getBucket())
                .objectKey(entity.getObjectKey())
                .versionId(entity.getVersionId())
                .isLatest(entity.getIsLatest())
                .contentType(entity.getContentType())
                .contentLength(entity.getContentLength())
                .etag(entity.getEtag())
                .storageClass(entity.getStorageClass())
                .sha256Hex(entity.getSha256Hex())
                .metadata(entity.getMetadata())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public StorageObjectLinkResponseDto toLinkResponse(StorageObjectLink link, StorageObject object) {
        return StorageObjectLinkResponseDto.builder()
                .id(link.getId())
                .code(link.getCode())
                .status(link.getStatus())
                .storageObjectId(link.getStorageObjectId())
                .entityType(link.getEntityType())
                .entityId(link.getEntityId())
                .linkRole(link.getLinkRole())
                .displayName(link.getDisplayName())
                .storageObject(object != null ? toObjectResponse(object) : null)
                .createdAt(link.getCreatedAt())
                .updatedAt(link.getUpdatedAt())
                .build();
    }
}
