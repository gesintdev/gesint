package br.com.gommo.modules.careers.candidateportal.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CandidatePortalTokenResponseDto {
    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final long expiresInSeconds;
    private final String fullName;
    private final String email;
    private final String tenantSlug;
    private final String tenantName;
}
