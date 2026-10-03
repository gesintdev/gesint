package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import lombok.Builder;
import lombok.Getter;

import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationRejectionReasonEnum;

@Getter
@Builder
public class JobVacancyApplicationRejectionReasonDto {
    private final JobVacancyApplicationRejectionReasonEnum key;
    private final String label;
    private final boolean requiresRequirement;
    private final boolean defaultSendFeedback;
    private final Integer minimumCompatibilityScore;

    public static JobVacancyApplicationRejectionReasonDto of(JobVacancyApplicationRejectionReasonEnum reason) {
        return JobVacancyApplicationRejectionReasonDto.builder()
                .key(reason)
                .label(reason.getLabel())
                .requiresRequirement(reason.isRequiresRequirement())
                .defaultSendFeedback(reason.isDefaultSendFeedback())
                .minimumCompatibilityScore(
                        reason == JobVacancyApplicationRejectionReasonEnum.ASSESSMENT_BELOW_MINIMUM
                                ? JobVacancyApplicationRejectionReasonEnum.MINIMUM_COMPATIBILITY_SCORE
                                : null)
                .build();
    }
}
