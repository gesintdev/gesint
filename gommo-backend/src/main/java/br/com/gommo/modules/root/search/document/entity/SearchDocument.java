package br.com.gommo.modules.root.search.document.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

import br.com.gommo.core.entity.AuditEntity;
import br.com.gommo.modules.root.search.document.SearchDocumentType;

@Entity
@Table(name = "search_document")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class SearchDocument extends AuditEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 40)
    private SearchDocumentType documentType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 255)
    private String subtitle;

    @Column(name = "search_text", nullable = false, columnDefinition = "TEXT")
    private String searchText;

    @Column(nullable = false, length = 255)
    private String href;
}
