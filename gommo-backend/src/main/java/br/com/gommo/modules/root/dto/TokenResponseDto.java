package br.com.gommo.modules.root.dto;

import java.util.UUID;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TokenResponseDto {

    private final String accessToken;
    private final String refreshToken;
    private final String tokenType;
    private final long expiresInSeconds;
    private final String username;
    private final String email;
    private final UUID photoObjectId;
    private final List<String> permissions;
    /** Usuario operador do Gommo Admin (admin.admin_user), login em host plataforma. */
    private final boolean platformAdmin;
}
