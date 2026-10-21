package br.com.gesint.modules.careers.candidateportal.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalMeResponseDto {
    private final UUID accountId;
    private final UUID candidateId;
    private final String fullName;
    private final String email;
    private final String phone;
    private final boolean emailVerified;
    private final boolean hasPassword;
    private final boolean googleLinked;
    private final boolean privacyConsentActive;
    private final boolean talentPoolConsentActive;
    private final String organizationName;
}
