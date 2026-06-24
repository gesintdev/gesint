package br.com.gommo.modules.cfg.settings.notification.controller;

import br.com.gommo.modules.cfg.settings.notification.dto.NotificationSettingsRequestDto;
import br.com.gommo.modules.cfg.settings.notification.dto.NotificationSettingsResponseDto;
import br.com.gommo.modules.cfg.settings.notification.service.NotificationSettingsService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notification-settings")
public class NotificationSettingsController {

    private final NotificationSettingsService service;

    public NotificationSettingsController(NotificationSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public NotificationSettingsResponseDto getSettings() {
        return service.getSettings();
    }

    @PutMapping
    public NotificationSettingsResponseDto updateSettings(@Valid @RequestBody NotificationSettingsRequestDto request) {
        return service.updateSettings(request);
    }
}
