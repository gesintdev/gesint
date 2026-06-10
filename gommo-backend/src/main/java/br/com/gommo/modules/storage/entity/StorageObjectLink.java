package br.com.gommo.modules.storage.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;

@Entity
@Table(name = "storage_object_link")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class StorageObjectLink extends AuditEntity {

    @Column(name = "storage_object_id", nullable = false)
    private UUID storageObjectId;

    @Column(name = "entity_type", nullable = false, length = 64)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "link_role", nullable = false, length = 32)
    private String linkRole;

    @Column(name = "display_name", length = 255)
    private String displayName;

    @Column(name = "document_type", length = 64)
    private String documentType;
}
