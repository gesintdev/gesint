package br.com.gommo.modules.careers.candidateportal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidatePortalConsentUpdateRequestDto {
    /** Quando false, revoga o banco de talentos nas candidaturas ativas. */
    private Boolean talentPoolConsent;
}
