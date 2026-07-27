package br.com.gommo.modules.root.search.document.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.gommo.core.base.repository.IBaseRepository;
import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.document.entity.SearchDocument;

@Repository
public interface SearchDocumentRepository extends IBaseRepository<SearchDocument> {

    Optional<SearchDocument> findByDocumentTypeAndEntityId(
            SearchDocumentType documentType, UUID entityId);

    Optional<SearchDocument> findByDocumentTypeAndEntityIdAndStatusNot(
            SearchDocumentType documentType, UUID entityId, StatusEnum status);

    @Query(
            """
            SELECT d FROM SearchDocument d
            WHERE d.status <> :deleted
              AND d.documentType = :documentType
              AND LOWER(FUNCTION('unaccent', d.searchText)) LIKE LOWER(FUNCTION('unaccent', :pattern))
            ORDER BY d.title ASC
            """)
    List<SearchDocument> searchByType(
            @Param("deleted") StatusEnum deleted,
            @Param("documentType") SearchDocumentType documentType,
            @Param("pattern") String pattern,
            Pageable pageable);
}
