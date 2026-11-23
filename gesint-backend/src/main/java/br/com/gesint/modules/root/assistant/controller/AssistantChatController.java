package br.com.gesint.modules.root.assistant.controller;

import java.util.Map;
import java.util.UUID;

import jakarta.validation.Valid;

import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import tools.jackson.databind.ObjectMapper;

import br.com.gesint.core.branch.BranchContextHolder;
import br.com.gesint.core.exception.BusinessException;
import br.com.gesint.core.tenant.TenantContext;
import br.com.gesint.core.tenant.TenantContextHolder;
import br.com.gesint.modules.root.assistant.activity.AssistantActivity;
import br.com.gesint.modules.root.assistant.dto.AssistantChatRequestDto;
import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gesint.modules.root.assistant.service.IAssistantChatService;

@RestController
@RequestMapping("/api/v1/assistant")
public class AssistantChatController {

    private static final long STREAM_TIMEOUT_MS = 180_000L;

    private final IAssistantChatService assistantChatService;
    private final ObjectMapper objectMapper;

    public AssistantChatController(IAssistantChatService assistantChatService, ObjectMapper objectMapper) {
        this.assistantChatService = assistantChatService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponseDto> chat(@Valid @RequestBody AssistantChatRequestDto request) {
        return ResponseEntity.ok(assistantChatService.chat(request));
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@Valid @RequestBody AssistantChatRequestDto request) {
        SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT_MS);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        TenantContext tenant = TenantContextHolder.getOptional().orElse(null);
        UUID branchId = BranchContextHolder.getOptional().orElse(null);
        Map<String, String> mdc = MDC.getCopyOfContextMap();
        Thread.startVirtualThread(() -> runStream(emitter, request, authentication, tenant, branchId, mdc));
        return emitter;
    }

    private void runStream(
            SseEmitter emitter,
            AssistantChatRequestDto request,
            Authentication authentication,
            TenantContext tenant,
            UUID branchId,
            Map<String, String> mdc) {
        try {
            if (authentication != null) {
                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            }
            if (branchId != null) {
                BranchContextHolder.set(branchId);
            }
            if (tenant != null) {
                TenantContextHolder.set(tenant);
            }
            if (mdc != null) {
                MDC.setContextMap(mdc);
            }
            AssistantActivity.bind(text -> sendStatus(emitter, text));
            AssistantActivity.report("Pensando...");
            AssistantChatResponseDto response = assistantChatService.chat(request);
            emitter.send(SseEmitter.event().name("reply").data(objectMapper.writeValueAsString(response)));
            emitter.complete();
        } catch (Exception ex) {
            sendError(emitter, publicMessage(ex));
            emitter.complete();
        } finally {
            AssistantActivity.clear();
            SecurityContextHolder.clearContext();
            TenantContextHolder.clear();
            BranchContextHolder.clear();
            MDC.clear();
        }
    }

    private void sendStatus(SseEmitter emitter, String text) {
        try {
            emitter.send(SseEmitter.event().name("status").data(objectMapper.writeValueAsString(Map.of("text", text))));
        } catch (Exception ignored) {
            // O cliente pode ter fechado o chat no meio da consulta.
        }
    }

    private void sendError(SseEmitter emitter, String message) {
        try {
            emitter.send(SseEmitter.event()
                    .name("error")
                    .data(objectMapper.writeValueAsString(Map.of("message", message))));
        } catch (Exception ignored) {
            // idem
        }
    }

    private static String publicMessage(Exception ex) {
        if (ex instanceof BusinessException business && StringUtils.hasText(business.getMessage())) {
            return business.getMessage();
        }
        return "Não consegui concluir a consulta agora.";
    }
}
