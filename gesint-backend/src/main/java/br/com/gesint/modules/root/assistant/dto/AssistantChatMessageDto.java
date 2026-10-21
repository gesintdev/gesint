package br.com.gesint.modules.root.assistant.dto;

import jakarta.validation.constraints.NotBlank;

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
public class AssistantChatMessageDto {

    /** user | assistant */
    @NotBlank
    private String role;

    @NotBlank
    private String content;
}
