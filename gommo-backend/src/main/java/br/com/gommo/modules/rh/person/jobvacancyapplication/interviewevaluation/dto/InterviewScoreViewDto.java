package br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto;

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
public class InterviewScoreViewDto {

    private UUID competencyId;
    private String competencyName;
    private Integer score;
    private String justification;
}
