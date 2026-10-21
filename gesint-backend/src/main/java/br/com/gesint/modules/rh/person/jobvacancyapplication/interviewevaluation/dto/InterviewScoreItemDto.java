package br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class InterviewScoreItemDto {

    @NotNull private UUID competencyId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer score;

    @Size(max = 2000)
    private String justification;
}
