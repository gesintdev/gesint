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

    /**
     * Indice e unico por {@code (document_type, entity_id)}: busca sem filtro Hibernate de filial.
     * Sem isso, ao mudar o escopo do cadastro (ex.: cargo de filial para todas as filiais) a linha
     * antiga some do filtro e o indexer tenta inserir outra, violando {@code search_document_code_key}.
     */
    @Query(
            value =
                    """
                    SELECT * FROM search_document
                    WHERE document_type = CAST(:documentType AS VARCHAR)
                      AND entity_id = :entityId
                    LIMIT 1
                    """,
            nativeQuery = true)
    Optional<SearchDocument> findByDocumentTypeAndEntityIdUnscoped(
            @Param("documentType") String documentType, @Param("entityId") UUID entityId);

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
