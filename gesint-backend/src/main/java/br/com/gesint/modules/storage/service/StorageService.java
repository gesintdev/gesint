package br.com.gesint.modules.storage.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.gesint.core.audit.trail.AuditActionEnum;
import br.com.gesint.core.audit.trail.AuditTrailEntry;
import br.com.gesint.core.audit.trail.AuditTrailRecorder;
import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.cfg.settings.documenttype.entity.DocumentDataClassEnum;
import br.com.gesint.modules.storage.access.StorageAttachmentAccessGuard;
import br.com.gesint.modules.storage.config.StorageProperties;
import br.com.gesint.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gesint.modules.storage.dto.StorageObjectResponseDto;
import br.com.gesint.modules.storage.entity.StorageObject;
import br.com.gesint.modules.storage.entity.StorageObjectLink;
import br.com.gesint.modules.storage.exception.StorageException;
import br.com.gesint.modules.storage.mapper.StorageMapper;
import br.com.gesint.modules.storage.repository.StorageObjectLinkRepository;
import br.com.gesint.modules.storage.repository.StorageObjectRepository;

@Service
public class StorageService implements IStorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageService.class);

    private final StorageObjectRepository objectRepository;
    private final StorageObjectLinkRepository linkRepository;
    private final StorageMapper mapper;
    private final StorageProperties properties;
    private final StorageAttachmentAccessGuard attachmentAccessGuard;
    private final AuditTrailRecorder auditTrail;

    public StorageService(
            StorageObjectRepository objectRepository,
            StorageObjectLinkRepository linkRepository,
            StorageMapper mapper,
            StorageProperties properties,
            StorageAttachmentAccessGuard attachmentAccessGuard,
            AuditTrailRecorder auditTrail) {
        this.objectRepository = objectRepository;
        this.linkRepository = linkRepository;
        this.mapper = mapper;
        this.properties = properties;
        this.attachmentAccessGuard = attachmentAccessGuard;
        this.auditTrail = auditTrail;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('storage:write')")
    public StorageObjectResponseDto upload(MultipartFile file) {
        return uploadInternal(file);
    }

    @Override
    @Transactional
    public StorageObjectResponseDto uploadInternal(MultipartFile file) {
        return uploadInternal(file, null);
    }

    @Override
    @Transactional
    public StorageObjectResponseDto uploadInternal(MultipartFile file, UUID companyId) {
        if (file == null || file.isEmpty()) {
            log.warn("Upload rejeitado: arquivo ausente ou vazio (name={}, size={})", 
                    file != null ? file.getOriginalFilename() : null,
                    file != null ? file.getSize() : null);
            throw StorageException.uploadFailed();
        }
        if (file.getSize() > properties.maxFileSizeBytes()) {
            throw StorageException.fileTooLarge(properties.maxFileSizeBytes());
        }
        try {
            UUID objectId = UUID.randomUUID();
            String safeName = sanitizeFilename(file.getOriginalFilename());
            String objectKey = objectId + "/" + safeName;
            Path basePath = Path.of(properties.localBasePath()).toAbsolutePath().normalize();
            Path targetDir = basePath.resolve(objectId.toString());
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(safeName);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            try (InputStream in = file.getInputStream();
                    DigestInputStream din = new DigestInputStream(in, digest)) {
                Files.copy(din, targetFile, StandardCopyOption.REPLACE_EXISTING);
            }
            String sha256Hex = HexFormat.of().formatHex(digest.digest());
            String etag = sha256Hex;

            StorageObject entity = StorageObject.builder()
                    .bucket(properties.bucket() != null ? properties.bucket() : "gesint-local")
                    .objectKey(objectKey)
                    .versionId("null")
                    .isLatest(true)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .etag(etag)
                    .storageClass("STANDARD")
                    .localFilePath(targetFile.toString())
                    .sha256Hex(sha256Hex)
                    .metadata(new HashMap<>())
                    .companyId(companyId)
                    .build();
            entity.setStatus(StatusEnum.ACTIVE);
            return mapper.toObjectResponse(objectRepository.save(entity));
        } catch (IOException | NoSuchAlgorithmException e) {
            log.error(
                    "Falha ao gravar arquivo em {} (name={}, size={}, contentType={}): {}",
                    properties.localBasePath(),
                    file.getOriginalFilename(),
                    file.getSize(),
                    file.getContentType(),
                    e.toString(),
                    e);
            throw StorageException.uploadFailed();
        } catch (RuntimeException e) {
            log.error(
                    "Falha ao persistir metadados do upload (name={}, size={}): {}",
                    file.getOriginalFilename(),
                    file.getSize(),
                    e.toString(),
                    e);
            throw e;
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('storage:write')")
    public StorageObjectLinkResponseDto linkToEntity(
            String entityType, UUID entityId, UUID objectId, String linkRole, String displayName, String documentType) {
        return linkToEntityInternal(entityType, entityId, objectId, linkRole, displayName, documentType, null);
    }

    @Override
    @Transactional
    public StorageObjectLinkResponseDto linkToEntityInternal(
            String entityType, UUID entityId, UUID objectId, String linkRole, String displayName, String documentType) {
        return linkToEntityInternal(entityType, entityId, objectId, linkRole, displayName, documentType, null);
    }

    @Override
    @Transactional
    public StorageObjectLinkResponseDto linkToEntityInternal(
            String entityType,
            UUID entityId,
            UUID objectId,
            String linkRole,
            String displayName,
            String documentType,
            UUID companyId) {
        StorageObject object = findActiveObject(objectId);
        StorageObjectLink link = StorageObjectLink.builder()
                .storageObjectId(object.getId())
                .entityType(entityType)
                .entityId(entityId)
                .linkRole(linkRole != null ? linkRole : "DOCUMENT")
                .displayName(displayName)
                .documentType(documentType)
                .companyId(companyId != null ? companyId : object.getCompanyId())
                .build();
        link.setStatus(StatusEnum.ACTIVE);
        link = linkRepository.save(link);
        return mapper.toLinkResponse(link, object);
    }

    @Override
    @Transactional
    public StorageObjectLinkResponseDto replaceLinkedFileInternal(
            String entityType,
            UUID entityId,
            MultipartFile file,
            String linkRole,
            String displayName,
            String documentType,
            UUID companyId) {
        StorageObjectResponseDto uploaded = uploadInternal(file, companyId);
        softDeleteLinksByEntityAndRole(entityType, entityId, linkRole);
        return linkToEntityInternal(
                entityType, entityId, uploaded.getId(), linkRole, displayName, documentType, companyId);
    }

    @Override
    @Transactional
    public void softDeleteLinksByEntityAndRole(String entityType, UUID entityId, String linkRole) {
        if (entityType == null || entityId == null || linkRole == null || linkRole.isBlank()) {
            return;
        }
        linkRepository
                .findAllByEntityTypeAndEntityIdAndStatusNot(entityType, entityId, StatusEnum.DELETED)
                .stream()
                .filter(link -> linkRole.equals(link.getLinkRole()))
                .forEach(link -> {
                    link.setStatus(StatusEnum.DELETED);
                    linkRepository.save(link);
                });
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('storage:read')")
    public List<StorageObjectLinkResponseDto> listByEntity(String entityType, UUID entityId) {
        attachmentAccessGuard.assertCanList(entityType);
        return listByEntityInternal(entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StorageObjectLinkResponseDto> listByEntityInternal(String entityType, UUID entityId) {
        return linkRepository
                .findAllByEntityTypeAndEntityIdAndStatusNot(entityType, entityId, StatusEnum.DELETED)
                .stream()
                .map(link -> {
                    StorageObject object = objectRepository
                            .findByIdAndStatusNot(link.getStorageObjectId(), StatusEnum.DELETED)
                            .orElse(null);
                    return mapper.toLinkResponse(link, object);
                })
                .toList();
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('storage:write')")
    public StorageObjectLinkResponseDto updateLinkDocumentType(UUID linkId, String documentType) {
        StorageObjectLink link = linkRepository
                .findByIdAndStatusNot(linkId, StatusEnum.DELETED)
                .orElseThrow(StorageException::linkNotFound);
        link.setDocumentType(documentType);
        link = linkRepository.save(link);
        StorageObject object = objectRepository
                .findByIdAndStatusNot(link.getStorageObjectId(), StatusEnum.DELETED)
                .orElse(null);
        return mapper.toLinkResponse(link, object);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('storage:read')")
    public InputStream download(UUID objectId) {
        attachmentAccessGuard.assertCanDownload(objectId).ifPresent(restricted -> auditTrail.recordIsolated(
                AuditTrailEntry.of(AuditActionEnum.ATTACHMENT_DOWNLOAD, StorageObject.class, objectId)
                        .detail(restricted.dataClass() == DocumentDataClassEnum.SENSIVEL ? "sensível" : "financeiro")
                        .recordLabel("Anexo de " + restricted.ownerLabel())));
        return downloadInternal(objectId);
    }

    @Override
    @Transactional(readOnly = true)
    public InputStream downloadInternal(UUID objectId) {
        StorageObject object = findActiveObject(objectId);
        Path path = Path.of(object.getLocalFilePath());
        if (!Files.isRegularFile(path)) {
            throw StorageException.fileMissing();
        }
        try {
            return Files.newInputStream(path);
        } catch (IOException e) {
            throw StorageException.fileMissing();
        }
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('storage:read')")
    public StorageObjectResponseDto findObject(UUID objectId) {
        attachmentAccessGuard.assertCanDownload(objectId);
        return mapper.toObjectResponse(findActiveObject(objectId));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('storage:delete')")
    public void delete(UUID objectId) {
        StorageObject object = findActiveObject(objectId);
        object.setStatus(StatusEnum.DELETED);
        objectRepository.save(object);
    }

    private StorageObject findActiveObject(UUID objectId) {
        return objectRepository
                .findByIdAndStatusNot(objectId, StatusEnum.DELETED)
                .orElseThrow(StorageException::notFound);
    }

    private static String sanitizeFilename(String original) {
        if (original == null || original.isBlank()) {
            return "upload.bin";
        }
        String name = Path.of(original).getFileName().toString();
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
