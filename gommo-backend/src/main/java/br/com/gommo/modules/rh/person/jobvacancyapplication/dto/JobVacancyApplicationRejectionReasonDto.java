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

    public static JobVacancyApplicationRejectionReasonDto of(JobVacancyApplicationRejectionReasonEnum reason) {
        return JobVacancyApplicationRejectionReasonDto.builder()
                .key(reason)
                .label(reason.getLabel())
                .requiresRequirement(reason.isRequiresRequirement())
                .defaultSendFeedback(reason.isDefaultSendFeedback())
                .build();
    }
}
