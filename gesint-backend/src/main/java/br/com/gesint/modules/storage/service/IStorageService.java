package br.com.gesint.modules.storage.service;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gesint.modules.storage.dto.StorageObjectResponseDto;

public interface IStorageService {

    StorageObjectResponseDto upload(MultipartFile file);

    /** Upload sem checagem de authority — uso interno (ex.: candidatura pública). */
    StorageObjectResponseDto uploadInternal(MultipartFile file);

    StorageObjectResponseDto uploadInternal(MultipartFile file, UUID companyId);

    StorageObjectLinkResponseDto linkToEntity(
            String entityType, UUID entityId, UUID objectId, String linkRole, String displayName, String documentType);

    /** Link sem checagem de authority — uso interno (ex.: candidatura pública). */
    StorageObjectLinkResponseDto linkToEntityInternal(
            String entityType, UUID entityId, UUID objectId, String linkRole, String displayName, String documentType);

    StorageObjectLinkResponseDto linkToEntityInternal(
            String entityType,
            UUID entityId,
            UUID objectId,
            String linkRole,
            String displayName,
            String documentType,
            UUID companyId);

    /**
     * Upload + substitui o anexo daquele papel na entidade. Um unico caminho para
     * candidatura publica e demais fluxos internos que nao passam pelo endpoint autenticado.
     */
    StorageObjectLinkResponseDto replaceLinkedFileInternal(
            String entityType,
            UUID entityId,
            MultipartFile file,
            String linkRole,
            String displayName,
            String documentType,
            UUID companyId);

    void softDeleteLinksByEntityAndRole(String entityType, UUID entityId, String linkRole);

    List<StorageObjectLinkResponseDto> listByEntity(String entityType, UUID entityId);

    /** Listagem sem checagem de authority — uso interno (ex.: análise async de currículo). */
    List<StorageObjectLinkResponseDto> listByEntityInternal(String entityType, UUID entityId);

    StorageObjectLinkResponseDto updateLinkDocumentType(UUID linkId, String documentType);

    InputStream download(UUID objectId);

    /** Download sem checagem de authority — uso interno (ex.: análise async de currículo). */
    InputStream downloadInternal(UUID objectId);

    StorageObjectResponseDto findObject(UUID objectId);

    void delete(UUID objectId);
}
