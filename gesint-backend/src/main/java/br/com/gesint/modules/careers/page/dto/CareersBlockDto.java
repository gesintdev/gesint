package br.com.gesint.modules.careers.page.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import br.com.gesint.modules.careers.page.entity.CareersBlockTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CareersBlockDto {
    private UUID id;

    @NotNull
    private CareersBlockTypeEnum type;

    @Size(max = 200)
    private String title;

    @Size(max = 400)
    private String subtitle;

    @Builder.Default
    private Map<String, Object> content = new LinkedHashMap<>();

    @Builder.Default
    private Boolean visible = true;

    /** Somente leitura: bloco padrao do sistema (nao pode ser removido). */
    private Boolean systemBlock;
}
