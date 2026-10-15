package br.com.gommo.modules.cfg.access.audittrail.controller;

import jakarta.validation.Valid;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.core.audit.trail.AuditCategoryEnum;
import br.com.gommo.core.base.dto.PageableResponseDto;
import br.com.gommo.modules.cfg.access.audittrail.dto.AuditTrailResponseDto;
import br.com.gommo.modules.cfg.access.audittrail.dto.ExportAuditRequestDto;
import br.com.gommo.modules.cfg.access.audittrail.service.IAuditTrailService;

@RestController
@RequestMapping("/api/v1/audit-trail")
public class AuditTrailController {

    private final IAuditTrailService auditTrailService;

    public AuditTrailController(IAuditTrailService auditTrailService) {
        this.auditTrailService = auditTrailService;
    }

    @GetMapping
    public ResponseEntity<PageableResponseDto<AuditTrailResponseDto>> search(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) AuditCategoryEnum category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(auditTrailService.search(page, size, from, category, search));
    }

    @PostMapping("/exports")
    public ResponseEntity<Void> recordExport(@Valid @RequestBody ExportAuditRequestDto request) {
        auditTrailService.recordExport(request);
        return ResponseEntity.noContent().build();
    }
}
