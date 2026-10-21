package br.com.gesint.modules.root.assistant.service;

import br.com.gesint.modules.root.assistant.dto.AssistantChatRequestDto;
import br.com.gesint.modules.root.assistant.dto.AssistantChatResponseDto;

public interface IAssistantChatService {

    AssistantChatResponseDto chat(AssistantChatRequestDto request);
}
