package br.com.gommo.modules.rh.person.developmentplan.developmenttrack.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DevelopmentTrackCompetencyItemDto {

    private UUID id;

    @NotNull
    private UUID competencyId;

    @Size(max = 200)
    private String competencyName;

    private UUID expectedLevelId;

    private Integer expectedLevelOrder;

    private Boolean required;

    private Integer weight;
}
