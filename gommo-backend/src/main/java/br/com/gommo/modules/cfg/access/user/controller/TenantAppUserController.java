package br.com.gommo.modules.cfg.access.user.controller;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.cfg.access.user.dto.AppUserRequestDto;
import br.com.gommo.modules.cfg.access.user.dto.AppUserResponseDto;
import br.com.gommo.modules.cfg.access.user.service.ITenantAppUserService;

@RestController
@RequestMapping("/api/v1/app-users")
public class TenantAppUserController {

    private final ITenantAppUserService tenantAppUserService;

    public TenantAppUserController(ITenantAppUserService tenantAppUserService) {
        this.tenantAppUserService = tenantAppUserService;
    }

    @GetMapping
    public ResponseEntity<List<AppUserResponseDto>> findAll() {
        return ResponseEntity.ok(tenantAppUserService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUserResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(tenantAppUserService.findById(id));
    }

    @PostMapping
    public ResponseEntity<AppUserResponseDto> create(@Valid @RequestBody AppUserRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantAppUserService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppUserResponseDto> update(
            @PathVariable UUID id, @Valid @RequestBody AppUserRequestDto request) {
        return ResponseEntity.ok(tenantAppUserService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        tenantAppUserService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
