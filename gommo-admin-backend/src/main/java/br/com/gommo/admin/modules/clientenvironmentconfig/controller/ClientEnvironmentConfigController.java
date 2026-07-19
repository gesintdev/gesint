package br.com.gommo.admin.modules.clientenvironmentconfig.controller;

import jakarta.validation.Valid;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.admin.core.base.controller.BaseController;
import br.com.gommo.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigRequestDto;
import br.com.gommo.admin.modules.clientenvironmentconfig.dto.ClientEnvironmentConfigResponseDto;
import br.com.gommo.admin.modules.clientenvironmentconfig.service.IClientEnvironmentConfigService;

@RestController
@RequestMapping("/api/v1/client-environment-configs")
public class ClientEnvironmentConfigController
        extends BaseController<ClientEnvironmentConfigRequestDto, ClientEnvironmentConfigResponseDto> {

    private final IClientEnvironmentConfigService service;

    public ClientEnvironmentConfigController(IClientEnvironmentConfigService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/by-client/{clientId}")
    public ResponseEntity<ClientEnvironmentConfigResponseDto> findByClient(@PathVariable UUID clientId) {
        return ResponseEntity.ok(service.findByClientId(clientId));
    }

    @PutMapping("/by-client/{clientId}")
    public ResponseEntity<ClientEnvironmentConfigResponseDto> upsertByClient(
            @PathVariable UUID clientId, @Valid @RequestBody ClientEnvironmentConfigRequestDto request) {
        return ResponseEntity.ok(service.upsertByClient(clientId, request));
    }
}
