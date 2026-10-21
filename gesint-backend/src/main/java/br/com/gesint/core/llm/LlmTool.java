package br.com.gesint.core.llm;

import java.util.LinkedHashMap;
import java.util.Map;

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
public class LlmTool {

    private String name;
    private String description;

    /** JSON Schema simplificado dos parâmetros (type/object/properties/required). */
    @Builder.Default
    private Map<String, Object> parameters = new LinkedHashMap<>();
}
