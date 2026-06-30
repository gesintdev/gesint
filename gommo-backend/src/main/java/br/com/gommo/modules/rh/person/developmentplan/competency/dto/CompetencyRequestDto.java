package br.com.gommo.modules.rh.person.developmentplan.competency.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.rh.person.developmentplan.entity.CompetencyTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetencyRequestDto {

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private CompetencyTypeEnum type;
}
