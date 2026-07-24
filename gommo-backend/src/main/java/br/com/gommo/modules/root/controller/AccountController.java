package br.com.gommo.modules.root.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.modules.root.dto.ChangePasswordRequestDto;
import br.com.gommo.modules.root.service.IAuthService;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private final IAuthService authService;

    public AccountController(IAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequestDto request) {
        authService.changePassword(request);
        return ResponseEntity.noContent().build();
    }
}
