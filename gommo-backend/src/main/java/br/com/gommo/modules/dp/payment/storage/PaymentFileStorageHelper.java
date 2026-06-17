package br.com.gommo.modules.dp.payment.storage;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.storage.config.StorageProperties;
import br.com.gommo.modules.storage.entity.StorageObject;
import br.com.gommo.modules.storage.repository.StorageObjectRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class PaymentFileStorageHelper {

    private final StorageObjectRepository objectRepository;
    private final StorageProperties properties;

    public PaymentFileStorageHelper(StorageObjectRepository objectRepository, StorageProperties properties) {
        this.objectRepository = objectRepository;
        this.properties = properties;
    }

    public UUID storePdfBytes(byte[] bytes, String filename) {
        try {
            UUID objectId = UUID.randomUUID();
            String safeName = sanitizeFilename(filename);
            Path basePath = Path.of(properties.localBasePath()).toAbsolutePath().normalize();
            Path targetDir = basePath.resolve(objectId.toString());
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(safeName);
            Files.write(targetFile, bytes);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String sha256Hex = HexFormat.of().formatHex(digest.digest(bytes));

            StorageObject entity = StorageObject.builder()
                    .bucket(properties.bucket() != null ? properties.bucket() : "gommo-local")
                    .objectKey(objectId + "/" + safeName)
                    .versionId("null")
                    .isLatest(true)
                    .contentType("application/pdf")
                    .contentLength((long) bytes.length)
                    .etag(sha256Hex)
                    .storageClass("STANDARD")
                    .localFilePath(targetFile.toString())
                    .sha256Hex(sha256Hex)
                    .metadata(new HashMap<>())
                    .build();
            entity.setStatus(StatusEnum.ACTIVE);
            return objectRepository.save(entity).getId();
        } catch (IOException | java.security.NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Failed to store payment PDF", ex);
        }
    }

    public byte[] readBytes(UUID objectId) {
        StorageObject object = objectRepository
                .findById(objectId)
                .filter(item -> item.getStatus() != StatusEnum.DELETED)
                .orElseThrow(() -> new IllegalStateException("Storage object not found"));
        try {
            return Files.readAllBytes(Path.of(object.getLocalFilePath()));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read storage object", ex);
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "payment.pdf";
        }
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
