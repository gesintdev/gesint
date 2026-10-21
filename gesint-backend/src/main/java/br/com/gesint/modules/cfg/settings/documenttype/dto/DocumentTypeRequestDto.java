package br.com.gesint.modules.cfg.settings.documenttype.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

import br.com.gesint.modules.cfg.settings.documenttype.entity.DocumentDataClassEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeRequestDto {

    @NotBlank
    @Size(max = 64)
    private String typeCode;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private DocumentDataClassEnum dataClass;

    @Builder.Default
    private List<String> contexts = new ArrayList<>();

    private Integer sortOrder;
}
