package br.com.gommo.admin.modules.client.controller;

import br.com.gommo.admin.core.base.controller.BaseController;
import br.com.gommo.admin.modules.client.dto.ClientRequestDto;
import br.com.gommo.admin.modules.client.dto.ClientResponseDto;
import br.com.gommo.admin.modules.client.dto.TenantDatabaseTestResultDto;
import br.com.gommo.admin.modules.client.service.IClientService;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clients")
public class ClientController extends BaseController<ClientRequestDto, ClientResponseDto> {

    private final IClientService clientService;

    public ClientController(IClientService clientService) {
        super(clientService);
        this.clientService = clientService;
    }

    @PostMapping("/{id}/actions/test-database-connection")
    public ResponseEntity<TenantDatabaseTestResultDto> testDatabaseConnection(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.testDatabaseConnection(id));
    }

    @PostMapping("/{id}/actions/start-provisioning")
    public ResponseEntity<ClientResponseDto> startProvisioning(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.startProvisioning(id));
    }
}
