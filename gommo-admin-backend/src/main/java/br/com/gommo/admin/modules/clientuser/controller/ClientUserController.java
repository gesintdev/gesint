package br.com.gommo.admin.modules.clientuser.controller;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserRequestDto;
import br.com.gommo.admin.modules.clientuser.dto.ClientUserResponseDto;
import br.com.gommo.admin.modules.clientuser.service.IClientUserService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/client-users")
public class ClientUserController {

    private final IClientUserService service;

    public ClientUserController(IClientUserService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ClientUserResponseDto>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/page")
    public ResponseEntity<PageableResponseDto<ClientUserResponseDto>> findPage(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.findPage(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientUserResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ClientUserResponseDto> create(@Valid @RequestBody ClientUserRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientUserResponseDto> update(
            @PathVariable UUID id, @Valid @RequestBody ClientUserRequestDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
