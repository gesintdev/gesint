package br.com.gommo.modules.storage.service;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.storage.config.StorageProperties;
import br.com.gommo.modules.storage.dto.StorageObjectLinkResponseDto;
import br.com.gommo.modules.storage.dto.StorageObjectResponseDto;
import br.com.gommo.modules.storage.entity.StorageObject;
import br.com.gommo.modules.storage.entity.StorageObjectLink;
import br.com.gommo.modules.storage.exception.StorageException;
import br.com.gommo.modules.storage.mapper.StorageMapper;
import br.com.gommo.modules.storage.repository.StorageObjectLinkRepository;
import br.com.gommo.modules.storage.repository.StorageObjectRepository;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageService implements IStorageService {

    private final StorageObjectRepository objectRepository;
    private final StorageObjectLinkRepository linkRepository;
    private final StorageMapper mapper;
    private final StorageProperties properties;

    public StorageService(
            StorageObjectRepository objectRepository,
            StorageObjectLinkRepository linkRepository,
            StorageMapper mapper,
            StorageProperties properties) {
        this.objectRepository = objectRepository;
        this.linkRepository = linkRepository;
        this.mapper = mapper;
        this.properties = properties;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('storage:write')")
    public StorageObjectResponseDto upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
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
            // etag VARCHAR(64): hash hex cabe exatamente; aspas estourariam o limite
            String etag = sha256Hex;

            StorageObject entity = StorageObject.builder()
                    .bucket(properties.bucket() != null ? properties.bucket() : "gommo-local")
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
                    .build();
            entity.setStatus(StatusEnum.ACTIVE);
            return mapper.toObjectResponse(objectRepository.save(entity));
        } catch (IOException | NoSuchAlgorithmException e) {
            throw StorageException.uploadFailed();
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('storage:write')")
    public StorageObjectLinkResponseDto linkToEntity(
            String entityType, UUID entityId, UUID objectId, String linkRole, String displayName, String documentType) {
        StorageObject object = findActiveObject(objectId);
        StorageObjectLink link = StorageObjectLink.builder()
                .storageObjectId(object.getId())
                .entityType(entityType)
                .entityId(entityId)
                .linkRole(linkRole != null ? linkRole : "DOCUMENT")
                .displayName(displayName)
                .documentType(documentType)
                .build();
        link.setStatus(StatusEnum.ACTIVE);
        link = linkRepository.save(link);
        return mapper.toLinkResponse(link, object);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('storage:read')")
    public List<StorageObjectLinkResponseDto> listByEntity(String entityType, UUID entityId) {
        return linkRepository.findAllByEntityTypeAndEntityIdAndStatusNot(entityType, entityId, StatusEnum.DELETED)
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
