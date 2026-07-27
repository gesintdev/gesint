package br.com.gommo.modules.root.search.document.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gommo.core.entity.StatusEnum;
import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.document.entity.SearchDocument;
import br.com.gommo.modules.root.search.document.repository.SearchDocumentRepository;

@Service
public class SearchDocumentIndexer implements ISearchDocumentIndexer {

    private final SearchDocumentRepository repository;

    public SearchDocumentIndexer(SearchDocumentRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public void upsert(
            SearchDocumentType type,
            UUID entityId,
            String title,
            String subtitle,
            String searchText,
            String href) {
        SearchDocument document = repository
                .findByDocumentTypeAndEntityId(type, entityId)
                .orElseGet(() -> SearchDocument.builder()
                        .documentType(type)
                        .entityId(entityId)
                        .status(StatusEnum.ACTIVE)
                        .build());
        document.setStatus(StatusEnum.ACTIVE);
        document.setTitle(title);
        document.setSubtitle(subtitle);
        document.setSearchText(searchText != null ? searchText : title);
        document.setHref(href);
        repository.save(document);
    }

    @Override
    @Transactional
    public void remove(SearchDocumentType type, UUID entityId) {
        repository.findByDocumentTypeAndEntityId(type, entityId).ifPresent(document -> {
            if (document.getStatus() == StatusEnum.DELETED) {
                return;
            }
            document.setStatus(StatusEnum.DELETED);
            repository.save(document);
        });
    }
}
