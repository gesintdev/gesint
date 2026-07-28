package br.com.gommo.modules.root.assistant.service;

import br.com.gommo.modules.root.assistant.dto.AssistantChatRequestDto;
import br.com.gommo.modules.root.assistant.dto.AssistantChatResponseDto;

public interface IAssistantChatService {

    AssistantChatResponseDto chat(AssistantChatRequestDto request);
}
