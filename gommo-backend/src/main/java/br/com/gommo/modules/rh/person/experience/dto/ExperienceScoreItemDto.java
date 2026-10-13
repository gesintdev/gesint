package br.com.gommo.modules.rh.person.experience.dto;

import jakarta.validation.constraints.NotNull;
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
public class ExperienceScoreItemDto {
    @NotNull
    private UUID competencyId;

    private Integer score;

    private String justification;
}
