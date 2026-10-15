package br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto;

import jakarta.validation.Valid;
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

import br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.InterviewRecommendationEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScorecardUpsertRequestDto {

    @NotBlank
    @Size(max = 80)
    private String columnKey;

    private InterviewRecommendationEnum recommendation;

    @NotNull
    @Valid
    @Builder.Default
    private List<InterviewScoreItemDto> scores = new ArrayList<>();
}
