package br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.InterviewEvaluationStatusEnum;
import br.com.gesint.modules.rh.person.jobvacancyapplication.interviewevaluation.entity.InterviewRecommendationEnum;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewEvaluationViewDto {

    private UUID id;
    private UUID evaluatorUserId;
    private String evaluatorName;
    private InterviewEvaluationStatusEnum evaluationStatus;
    private InterviewRecommendationEnum recommendation;
    private OffsetDateTime submittedAt;
    private boolean mine;
    private boolean scoresVisible;

    @Builder.Default
    private List<InterviewScoreViewDto> scores = new ArrayList<>();
}
