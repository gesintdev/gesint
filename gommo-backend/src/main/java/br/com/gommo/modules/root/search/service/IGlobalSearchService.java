package br.com.gommo.modules.root.search.service;

import br.com.gommo.modules.root.search.dto.GlobalSearchResponseDto;

public interface IGlobalSearchService {

    GlobalSearchResponseDto search(String query, int limitPerType);
}
