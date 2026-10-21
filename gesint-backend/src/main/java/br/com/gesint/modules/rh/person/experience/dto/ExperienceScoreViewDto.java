package br.com.gesint.modules.rh.person.experience.dto;

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
public class ExperienceScoreViewDto {
    private UUID competencyId;
    private String competencyName;
    private Integer score;
    private String justification;
}
