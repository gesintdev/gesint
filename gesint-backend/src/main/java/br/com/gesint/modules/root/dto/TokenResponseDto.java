package br.com.gesint.modules.root.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;

/**
 * Resposta enxuta de login/refresh: identidade + tokens. Permissoes, filiais e sistemas
 * contratados vao em {@link SessionBootstrapDto} ({@code GET /auth/me}) para nao inflar o
 * cookie da sessao NextAuth (HTTP 431).
 */
@Getter
@Builder
public class TokenResponseDto {

    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final long expiresInSeconds;
    private final String name;
    private final String username;
    private final String email;
    private final String tenantSlug;
    private final String tenantName;
    private final UUID collaboratorId;
    private final UUID photoObjectId;
    /** Usuario operador do Gesint Admin (admin.admin_user), login em host plataforma. */
    private final boolean platformAdmin;
}
