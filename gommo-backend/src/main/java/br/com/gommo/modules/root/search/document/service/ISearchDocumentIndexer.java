package br.com.gommo.modules.root.search.document.service;

import java.util.UUID;

import br.com.gommo.modules.root.search.document.SearchDocumentType;

public interface ISearchDocumentIndexer {

  /** {@code companyId} nulo = documento visivel em todas as filiais (catalogo compartilhado). */
    void upsert(
            SearchDocumentType type,
            UUID entityId,
            UUID companyId,
            String title,
            String subtitle,
            String searchText,
            String href);

    void remove(SearchDocumentType type, UUID entityId);
}
