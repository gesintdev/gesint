package br.com.gommo.modules.storage.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "storage_object")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class StorageObject extends AuditEntity {

    @Column(nullable = false, length = 63)
    private String bucket;

    @Column(name = "object_key", nullable = false, length = 1024)
    private String objectKey;

    @Column(name = "version_id", nullable = false, length = 36)
    private String versionId;

    @Column(name = "is_latest", nullable = false)
    private Boolean isLatest;

    @Column(name = "content_type", length = 255)
    private String contentType;

    @Column(name = "content_length", nullable = false)
    private Long contentLength;

    @Column(length = 64)
    private String etag;

    @Column(name = "storage_class", nullable = false, length = 32)
    private String storageClass;

    @Column(name = "server_side_encryption", length = 32)
    private String serverSideEncryption;

    @Column(name = "local_file_path", length = 2048)
    private String localFilePath;

    @Column(name = "sha256_hex", length = 64)
    private String sha256Hex;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> metadata;
}
