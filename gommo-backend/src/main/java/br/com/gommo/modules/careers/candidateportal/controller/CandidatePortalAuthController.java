package br.com.gommo.modules.careers.candidateportal.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.careers.candidateportal.config.CandidatePortalProperties;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalGoogleLoginRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalLoginRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalRefreshRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalRegisterRequestDto;
import br.com.gommo.modules.careers.candidateportal.dto.CandidatePortalTokenResponseDto;
import br.com.gommo.modules.careers.candidateportal.service.CandidatePortalAuthService;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/candidate/auth")
public class CandidatePortalAuthController {

    private final CandidatePortalAuthService authService;
    private final CandidatePortalProperties properties;

    public CandidatePortalAuthController(
            CandidatePortalAuthService authService, CandidatePortalProperties properties) {
        this.authService = authService;
        this.properties = properties;
    }

    @GetMapping("/providers")
    public ResponseEntity<Map<String, Object>> providers() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("password", true);
        body.put("google", properties.isGoogleConfigured());
        body.put("googleClientId", properties.isGoogleConfigured() ? properties.getGoogleClientId() : "");
        return ResponseEntity.ok(body);
    }

    @PostMapping("/register")
    public ResponseEntity<CandidatePortalTokenResponseDto> register(
            @Valid @RequestBody CandidatePortalRegisterRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<CandidatePortalTokenResponseDto> login(
            @Valid @RequestBody CandidatePortalLoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<CandidatePortalTokenResponseDto> google(
            @Valid @RequestBody CandidatePortalGoogleLoginRequestDto request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<CandidatePortalTokenResponseDto> refresh(
            @Valid @RequestBody CandidatePortalRefreshRequestDto request) {
        return ResponseEntity.ok(authService.refresh(request));
    }
}
