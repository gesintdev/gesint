package br.com.gommo.modules.root.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.root.dto.TenantSystemEventRequestDto;
import br.com.gommo.modules.root.service.TenantSystemEventService;

@RestController
@RequestMapping("/api/v1/internal/tenant-systems")
public class InternalTenantSystemEventController {

    private final TenantSystemEventService tenantSystemEventService;
    private final String internalSecret;

    public InternalTenantSystemEventController(
            TenantSystemEventService tenantSystemEventService,
            @Value("${gommo.internal.event-secret:}") String internalSecret) {
        this.tenantSystemEventService = tenantSystemEventService;
        this.internalSecret = internalSecret == null ? "" : internalSecret.trim();
    }

    @PostMapping("/events")
    public ResponseEntity<Void> handleEvent(
            @RequestHeader(value = "X-Internal-Event-Secret", required = false) String secret,
            @RequestBody TenantSystemEventRequestDto body) {
        if (!StringUtils.hasText(internalSecret) || !internalSecret.equals(secret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        boolean applied = tenantSystemEventService.handleContractedSystemChanged(body);
        if (!applied) {
            // Faz o outbox do Admin retentar em vez de marcar PROCESSED em no-op.
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.accepted().build();
    }
}
