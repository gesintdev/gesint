package br.com.gommo.modules.root.assistant.skill;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.root.assistant.dto.AssistantDeepLinkDto;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantSkillResult {

    /** Conteúdo JSON/texto devolvido ao modelo. */
    private String contentForModel;

    @Builder.Default
    private List<AssistantDeepLinkDto> links = new ArrayList<>();

    private boolean success;
}
