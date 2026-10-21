package br.com.gesint.admin.modules.platformemail.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.admin.modules.platformemail.dto.PlatformEmailSettingsRequestDto;
import br.com.gesint.admin.modules.platformemail.dto.PlatformEmailSettingsResponseDto;
import br.com.gesint.admin.modules.platformemail.dto.PlatformEmailTestRequestDto;
import br.com.gesint.admin.modules.platformemail.service.PlatformEmailSettingsService;

@RestController
@RequestMapping("/api/v1/platform-email-settings")
public class PlatformEmailSettingsController {

    private final PlatformEmailSettingsService service;

    public PlatformEmailSettingsController(PlatformEmailSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PlatformEmailSettingsResponseDto> get() {
        return ResponseEntity.ok(service.get());
    }

    @PutMapping
    public ResponseEntity<PlatformEmailSettingsResponseDto> save(
            @Valid @RequestBody PlatformEmailSettingsRequestDto request) {
        return ResponseEntity.ok(service.save(request));
    }

    @PostMapping("/test")
    public ResponseEntity<PlatformEmailSettingsResponseDto> sendTest(
            @Valid @RequestBody PlatformEmailTestRequestDto request) {
        return ResponseEntity.ok(service.sendTest(request.getTo()));
    }
}
