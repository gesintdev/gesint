package br.com.gesint.modules.root.assistant.dto;

import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Menu em que o usuário clicou com o botão direito. A conversa já nasce nesse assunto.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssistantMenuFocusDto {

    @Size(max = 80)
    private String routeId;

    @Size(max = 80)
    private String label;

    @Size(max = 40)
    private String userName;

    /** Primeira fala, aberta pelo menu. As seguintes reaproveitam o mesmo assunto. */
    private boolean opening;
}
