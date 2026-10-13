package br.com.gommo.admin.modules.assistanterrorlog.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.gommo.admin.core.base.dto.PageableResponseDto;
import br.com.gommo.admin.modules.assistanterrorlog.dto.AssistantErrorLogResponseDto;
import br.com.gommo.admin.modules.assistanterrorlog.service.AssistantErrorLogService;

@RestController
@RequestMapping("/api/v1/assistant-error-logs")
public class AssistantErrorLogController {

    private final AssistantErrorLogService service;

    public AssistantErrorLogController(AssistantErrorLogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<PageableResponseDto<AssistantErrorLogResponseDto>> page(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(service.findPage(page, size, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssistantErrorLogResponseDto> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
