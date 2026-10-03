package br.com.gommo.modules.rh.person.jobvacancyapplication.interviewevaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScorecardResponseDto {

    private UUID applicationId;
    private String columnKey;
    private boolean interviewColumn;
    private boolean canSeeOthers;
    private int submittedCount;

    @Builder.Default
    private List<InterviewCompetencyDto> competencies = new ArrayList<>();

    private InterviewEvaluationViewDto myEvaluation;

    @Builder.Default
    private List<InterviewEvaluationViewDto> otherEvaluations = new ArrayList<>();

    @Builder.Default
    private List<InterviewCompetencyAverageDto> averages = new ArrayList<>();
}
