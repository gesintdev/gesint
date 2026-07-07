package br.com.gommo.modules.root.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

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
    private final UUID collaboratorId;
    private final UUID photoObjectId;
    private final UUID jobPositionId;
    private final String jobPositionName;
    private final UUID departmentId;
    private final String departmentName;
    private final List<String> permissions;
    /** Usuario operador do Gommo Admin (admin.admin_user), login em host plataforma. */
    private final boolean platformAdmin;
}
