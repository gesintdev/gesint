package br.com.gesint.modules.root.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.root.dto.AccountPreferencesDto;
import br.com.gesint.modules.root.dto.ChangePasswordRequestDto;
import br.com.gesint.modules.root.service.IAccountPreferenceService;
import br.com.gesint.modules.root.service.IAuthService;

@RestController
@RequestMapping("/api/v1/account")
public class AccountController {

    private final IAuthService authService;
    private final IAccountPreferenceService preferenceService;

    public AccountController(IAuthService authService, IAccountPreferenceService preferenceService) {
        this.authService = authService;
        this.preferenceService = preferenceService;
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequestDto request) {
        authService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<AccountPreferencesDto> getPreferences() {
        return ResponseEntity.ok(preferenceService.getPreferences());
    }

    @PutMapping("/preferences")
    public ResponseEntity<AccountPreferencesDto> updatePreferences(
            @Valid @RequestBody AccountPreferencesDto request) {
        return ResponseEntity.ok(preferenceService.updatePreferences(request));
    }
}
