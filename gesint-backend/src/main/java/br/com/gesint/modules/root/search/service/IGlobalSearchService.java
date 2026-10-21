package br.com.gesint.modules.root.search.service;

import br.com.gesint.modules.root.search.dto.GlobalSearchResponseDto;

public interface IGlobalSearchService {

    GlobalSearchResponseDto search(String query, int limitPerType);
}
