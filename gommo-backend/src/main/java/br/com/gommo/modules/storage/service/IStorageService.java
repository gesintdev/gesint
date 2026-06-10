package br.com.gommo.modules.storage.service;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;

public interface IStorageService {

    StorageObjectResponseDto upload(MultipartFile file);

    StorageObjectLinkResponseDto linkToEntity(
            String entityType, UUID entityId, UUID objectId, String linkRole, String displayName, String documentType);

    List<StorageObjectLinkResponseDto> listByEntity(String entityType, UUID entityId);

    StorageObjectLinkResponseDto updateLinkDocumentType(UUID linkId, String documentType);

    InputStream download(UUID objectId);

    StorageObjectResponseDto findObject(UUID objectId);

    void delete(UUID objectId);
}
