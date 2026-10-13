package br.com.gommo.core.llm;

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
public class LlmMessage {

    /** user | assistant | system | tool */
    private String role;

    private String content;

    /** Para role=tool: id da chamada respondida. */
    private String toolCallId;

    /** Para role=tool (Gemini): nome da função. */
    private String name;

    /** Para role=assistant com function calling. */
    @Builder.Default
    private List<LlmToolCall> toolCalls = new ArrayList<>();
}
