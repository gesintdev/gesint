package br.com.gommo.modules.dp.organization.cbo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.dp.organization.cbo.dto.CboOccupationOptionDto;
import br.com.gommo.modules.dp.organization.cbo.service.CboOccupationLookupService;

@RestController
@RequestMapping("/api/v1/cbo-occupations")
public class CboOccupationLookupController {

    private final CboOccupationLookupService service;

    public CboOccupationLookupController(CboOccupationLookupService service) {
        this.service = service;
    }

    @GetMapping
    public PageableResponseDto<CboOccupationOptionDto> search(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return service.search(query, page, size);
    }

    @GetMapping("/by-code/{cboCode}")
    public ResponseEntity<CboOccupationOptionDto> findByCode(@PathVariable String cboCode) {
        CboOccupationOptionDto option = service.findByCode(cboCode);
        if (option == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(option);
    }
}
