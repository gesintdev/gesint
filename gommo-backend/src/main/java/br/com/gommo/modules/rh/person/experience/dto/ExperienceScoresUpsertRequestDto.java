package br.com.gommo.modules.rh.person.experience.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceScoresUpsertRequestDto {
    @NotNull
    @Valid
    @Builder.Default
    private List<ExperienceScoreItemDto> scores = new ArrayList<>();
}
