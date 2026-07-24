package br.com.gommo.modules.root.controller;

import java.util.Optional;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.root.dto.ForgotPasswordRequestDto;
import br.com.gommo.modules.root.dto.LoginRequestDto;
import br.com.gommo.modules.root.dto.PasswordSetupRequestDto;
import br.com.gommo.modules.root.dto.PasswordSetupValidateRequestDto;
import br.com.gommo.modules.root.dto.PasswordSetupValidateResponseDto;
import br.com.gommo.modules.root.dto.RefreshTokenRequestDto;
import br.com.gommo.modules.root.dto.TenantInfoResponseDto;
import br.com.gommo.modules.root.dto.TokenResponseDto;
import br.com.gommo.modules.root.service.IAuthService;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponseDto> refresh(@Valid @RequestBody RefreshTokenRequestDto request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/session-check")
    public ResponseEntity<Void> sessionCheck(@Valid @RequestBody RefreshTokenRequestDto request) {
        authService.assertRefreshSessionActive(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tenant")
    public ResponseEntity<TenantInfoResponseDto> currentTenant() {
        Optional<TenantInfoResponseDto> tenant = authService.currentTenant();
        return tenant.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/password-setup/validate")
    public ResponseEntity<PasswordSetupValidateResponseDto> validatePasswordSetup(
            @Valid @RequestBody PasswordSetupValidateRequestDto request) {
        return ResponseEntity.ok(authService.validatePasswordSetupToken(request));
    }

    @PostMapping("/password-setup")
    public ResponseEntity<Void> setupPassword(@Valid @RequestBody PasswordSetupRequestDto request) {
        authService.setupPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        authService.forgotPassword(request);
        return ResponseEntity.noContent().build();
    }
}
