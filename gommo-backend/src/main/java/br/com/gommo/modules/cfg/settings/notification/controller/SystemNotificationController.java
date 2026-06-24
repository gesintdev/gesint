package br.com.gommo.modules.cfg.settings.notification.controller;

import br.com.gommo.modules.cfg.settings.notification.dto.NotificationSummaryResponseDto;
import br.com.gommo.modules.cfg.settings.notification.dto.SystemNotificationResponseDto;
import br.com.gommo.modules.cfg.settings.notification.service.SystemNotificationService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
public class SystemNotificationController {

    private final SystemNotificationService service;

    public SystemNotificationController(SystemNotificationService service) {
        this.service = service;
    }

    @GetMapping
    public NotificationSummaryResponseDto getSummary() {
        return service.getSummary();
    }

    @PostMapping("/{id}/read")
    public SystemNotificationResponseDto markAsRead(@PathVariable UUID id) {
        return service.markAsRead(id);
    }
}
