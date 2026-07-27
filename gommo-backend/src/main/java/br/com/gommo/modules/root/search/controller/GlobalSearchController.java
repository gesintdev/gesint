package br.com.gommo.modules.root.search.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.root.search.dto.GlobalSearchResponseDto;
import br.com.gommo.modules.root.search.service.GlobalSearchService;
import br.com.gommo.modules.root.search.service.IGlobalSearchService;

@RestController
@RequestMapping("/api/v1/search")
public class GlobalSearchController {

    private final IGlobalSearchService globalSearchService;

    public GlobalSearchController(IGlobalSearchService globalSearchService) {
        this.globalSearchService = globalSearchService;
    }

    @GetMapping
    public ResponseEntity<GlobalSearchResponseDto> search(
            @RequestParam(name = "q", required = false) String query,
            @RequestParam(defaultValue = "" + GlobalSearchService.DEFAULT_LIMIT_PER_TYPE) int limitPerType) {
        return ResponseEntity.ok(globalSearchService.search(query, limitPerType));
    }
}
