package br.com.gommo.modules.root.search.document.service;

import java.util.UUID;

import br.com.gommo.modules.root.search.document.SearchDocumentType;

public interface ISearchDocumentIndexer {

    void upsert(
            SearchDocumentType type,
            UUID entityId,
            String title,
            String subtitle,
            String searchText,
            String href);

    void remove(SearchDocumentType type, UUID entityId);
}
