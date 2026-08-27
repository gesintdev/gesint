package br.com.gommo.core.tenant;

import java.util.Set;
import java.util.UUID;

/**
 * Companies do schema do tenant que correspondem a um estabelecimento cadastrado no admin.
 *
 * A tabela {@code company} deixou de ser cadastro manual do DP e passou a ser espelho de
 * {@code admin.client_branch} (e da matriz em {@code admin.client}). Linhas sem esse vinculo sao
 * residuo de seed de demonstracao ou de cadastro anterior ao modelo de filiais, e nao representam
 * estabelecimento do cliente.
 */
public interface TenantBranchLinkLookup {

    /** Vazio quando o cliente ainda nao teve as filiais espelhadas no schema. */
    Set<UUID> findProvisionedCompanyIds(UUID clientId);
}
