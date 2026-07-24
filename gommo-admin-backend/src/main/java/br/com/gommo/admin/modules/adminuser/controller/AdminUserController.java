package br.com.gommo.admin.modules.adminuser.controller;

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

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.modules.adminuser.dto.AdminUserRequestDto;
import br.com.gommo.admin.modules.adminuser.dto.AdminUserResponseDto;
import br.com.gommo.admin.modules.adminuser.service.IAdminUserService;

@RestController
@RequestMapping("/api/v1/admin-users")
public class AdminUserController {

    private final IAdminUserService service;

    public AdminUserController(IAdminUserService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponseDto>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/page")
    public ResponseEntity<PageableResponseDto<AdminUserResponseDto>> findPage(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.findPage(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminUserResponseDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<AdminUserResponseDto> create(@Valid @RequestBody AdminUserRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminUserResponseDto> update(
            @PathVariable UUID id, @Valid @RequestBody AdminUserRequestDto request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-access")
    public ResponseEntity<AdminUserResponseDto> resetAccess(@PathVariable UUID id) {
        return ResponseEntity.ok(service.resetAccess(id));
    }
}
