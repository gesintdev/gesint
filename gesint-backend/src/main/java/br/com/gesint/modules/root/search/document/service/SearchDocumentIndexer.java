package br.com.gesint.modules.root.search.document.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.gesint.core.entity.StatusEnum;
import br.com.gesint.modules.root.search.document.SearchDocumentType;
import br.com.gesint.modules.root.search.document.entity.SearchDocument;
import br.com.gesint.modules.root.search.document.repository.SearchDocumentRepository;

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
            UUID companyId,
            String title,
            String subtitle,
            String searchText,
            String href) {
        SearchDocument document = repository
                .findByDocumentTypeAndEntityIdUnscoped(type.name(), entityId)
                .orElseGet(() -> SearchDocument.builder()
                        .documentType(type)
                        .entityId(entityId)
                        .status(StatusEnum.ACTIVE)
                        .build());
        document.setCompanyId(companyId);
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
        repository.findByDocumentTypeAndEntityIdUnscoped(type.name(), entityId).ifPresent(document -> {
            if (document.getStatus() == StatusEnum.DELETED) {
                return;
            }
            document.setStatus(StatusEnum.DELETED);
            repository.save(document);
        });
    }
}
