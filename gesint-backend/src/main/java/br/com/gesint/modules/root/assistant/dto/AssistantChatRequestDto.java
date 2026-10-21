package br.com.gesint.modules.root.assistant.dto;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

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
public class AssistantChatRequestDto {

    @NotEmpty
    @Size(max = 40)
    @Valid
    @Builder.Default
    private List<AssistantChatMessageDto> messages = new ArrayList<>();
}
