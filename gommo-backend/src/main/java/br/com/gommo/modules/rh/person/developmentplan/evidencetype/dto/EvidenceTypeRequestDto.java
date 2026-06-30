package br.com.gommo.modules.rh.person.developmentplan.evidencetype.dto;

import jakarta.validation.constraints.NotBlank;
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
public class EvidenceTypeRequestDto {

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    private Boolean requiresFile;

    private Boolean allowsLink;
}
