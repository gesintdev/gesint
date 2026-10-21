package br.com.gesint.modules.root.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import br.com.gesint.modules.root.security.BranchAccessResolver;
import lombok.Builder;
import lombok.Getter;

/**
 * Ambiente do usuario apos o login. Consumido pelo AppBootstrapProvider do frontend — fora do
 * cookie Auth.js.
 */
@Getter
@Builder
public class SessionBootstrapDto {

    private final String name;
    private final String username;
    private final String email;
    private final String tenantSlug;
    private final String tenantName;
    private final boolean platformAdmin;

    private final UUID collaboratorId;
    /** Código de acesso do colaborador vinculado (ponto público / app). */
    private final String accessCode;
    private final UUID photoObjectId;
    private final UUID jobPositionId;
    private final String jobPositionName;
    private final UUID departmentId;
    private final String departmentName;

    /** Authorities flat (espelho da base do access token). */
    private final List<String> permissions;
    /** Authorities por sistema do perfil (DP/RH/CONTABILIDADE/CFG). */
    private final Map<String, List<String>> systemPermissions;
    private final List<BranchAccessResolver.BranchSummary> branches;

    /**
     * Keys do catalogo Admin validas em qualquer filial. Null = host plataforma / sem filtro
     * comercial.
     */
    private final List<String> contractedSystemKeys;
    /** Filiais cujo conjunto de keys difere da base. */
    private final Map<String, List<String>> contractedSystemKeyOverrides;

    /**
     * True quando o contrato do cliente habilita o assistente de I.A. ({@code with_ai}). Em host
     * plataforma / ambiente de desenvolvimento sem filtro comercial, fica true.
     */
    private final boolean assistantEnabled;
}
