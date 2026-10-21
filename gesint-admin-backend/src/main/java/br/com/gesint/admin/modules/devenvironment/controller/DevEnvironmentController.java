package br.com.gesint.admin.modules.devenvironment.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.admin.modules.devenvironment.dto.DevEnvironmentResponseDto;
import br.com.gesint.admin.modules.devenvironment.dto.DevEnvironmentUserUpdateRequestDto;
import br.com.gesint.admin.modules.devenvironment.service.DevEnvironmentService;

@RestController
@RequestMapping("/api/v1/dev-environment")
public class DevEnvironmentController {

    private final DevEnvironmentService service;

    public DevEnvironmentController(DevEnvironmentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<DevEnvironmentResponseDto> get() {
        return ResponseEntity.ok(service.get());
    }

    @PutMapping("/platform-user")
    public ResponseEntity<DevEnvironmentResponseDto> updatePlatformUser(
            @Valid @RequestBody DevEnvironmentUserUpdateRequestDto request) {
        return ResponseEntity.ok(service.update(request));
    }
}
