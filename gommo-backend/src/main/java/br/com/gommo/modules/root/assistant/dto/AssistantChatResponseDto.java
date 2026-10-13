package br.com.gommo.modules.root.assistant.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantChatResponseDto {

    private String reply;
    private String provider;
    private String model;
    private AssistantLlmUsageDto usage;

    @Builder.Default
    private List<AssistantDeepLinkDto> links = new ArrayList<>();
}
