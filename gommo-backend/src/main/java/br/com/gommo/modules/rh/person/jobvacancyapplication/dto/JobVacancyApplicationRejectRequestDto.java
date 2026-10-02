package br.com.gommo.modules.rh.person.jobvacancyapplication.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import br.com.gommo.modules.rh.person.jobvacancyapplication.entity.JobVacancyApplicationRejectionReasonEnum;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobVacancyApplicationRejectRequestDto {

    private JobVacancyApplicationRejectionReasonEnum reason;

    @Size(max = 300)
    private String requirement;

    @Size(max = 2000)
    private String note;

    private boolean sendFeedback;
}
