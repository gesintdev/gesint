package br.com.gesint.modules.careers.candidateportal.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidatePortalOfferDecisionRequestDto {

    @Size(max = 500)
    private String reason;
}
