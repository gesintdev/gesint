package br.com.gommo.admin.modules.clientcontractedsystem.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.admin.core.base.controller.BaseController;
import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemRequestDto;
import br.com.gommo.admin.modules.clientcontractedsystem.dto.ClientContractedSystemResponseDto;
import br.com.gommo.admin.modules.clientcontractedsystem.service.IClientContractedSystemService;

@RestController
@RequestMapping("/api/v1/client-contracted-systems")
public class ClientContractedSystemController
        extends BaseController<ClientContractedSystemRequestDto, ClientContractedSystemResponseDto> {

    private final IClientContractedSystemService service;

    public ClientContractedSystemController(IClientContractedSystemService service) {
        super(service);
        this.service = service;
    }

    @GetMapping("/by-client/{clientId}")
    public ResponseEntity<List<ClientContractedSystemResponseDto>> findAllByClient(@PathVariable UUID clientId) {
        return ResponseEntity.ok(service.findAllByClientId(clientId));
    }
}
