package br.com.gommo.modules.root.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gommo.modules.root.security.BranchAccessResolver;
import lombok.Builder;
import lombok.Getter;

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
    /**
     * Keys do catalogo Admin (DP, RH, CTB) validas em qualquer filial. Null = host plataforma
     * (sem filtro comercial).
     */
    private final List<String> contractedSystemKeys;
    /**
     * Filiais cujo conjunto de keys difere da base, no mesmo padrao de base mais excecoes usado
     * nas permissoes por filial para nao inflar a sessao.
     */
    private final Map<String, List<String>> contractedSystemKeyOverrides;
    private final UUID collaboratorId;
    private final UUID photoObjectId;
    private final UUID jobPositionId;
    private final String jobPositionName;
    private final UUID departmentId;
    private final String departmentName;
    private final List<String> permissions;
    /** Filiais a que o usuario tem acesso; alimenta o seletor de filial no header. */
    private final List<BranchAccessResolver.BranchSummary> branches;
    /** Usuario operador do Gommo Admin (admin.admin_user), login em host plataforma. */
    private final boolean platformAdmin;
}
