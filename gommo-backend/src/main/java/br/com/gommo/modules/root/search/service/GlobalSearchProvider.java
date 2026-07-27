package br.com.gommo.modules.root.search.service;

import java.util.List;

import br.com.gommo.modules.root.search.document.SearchDocumentType;
import br.com.gommo.modules.root.search.dto.GlobalSearchItemDto;

public interface GlobalSearchProvider {

    SearchDocumentType getType();

    String getLabel();

    String requiredAuthority();

    List<GlobalSearchItemDto> search(String query, int limit);
}
