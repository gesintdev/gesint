package br.com.gommo.modules.rh.person.developmentplan.actiontemplate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

import br.com.gommo.modules.rh.person.developmentplan.entity.DevelopmentActionTypeEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentActionTemplateRequestDto {

    @NotNull
    private UUID competencyId;

    @Size(max = 200)
    private String competencyName;

    @NotNull
    private Integer minGap;

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String suggestedDescription;

    @NotNull
    private DevelopmentActionTypeEnum actionType;

    private Integer suggestedDeadlineDays;

    private Boolean evidenceRequired;
}
