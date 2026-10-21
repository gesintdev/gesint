package br.com.gesint.modules.root.assistant.controller;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.gesint.modules.root.assistant.dto.AssistantChatRequestDto;
import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;
import br.com.gesint.modules.root.assistant.service.IAssistantChatService;

@RestController
@RequestMapping("/api/v1/assistant")
public class AssistantChatController {

    private final IAssistantChatService assistantChatService;

    public AssistantChatController(IAssistantChatService assistantChatService) {
        this.assistantChatService = assistantChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AssistantChatResponseDto> chat(@Valid @RequestBody AssistantChatRequestDto request) {
        return ResponseEntity.ok(assistantChatService.chat(request));
    }
}
