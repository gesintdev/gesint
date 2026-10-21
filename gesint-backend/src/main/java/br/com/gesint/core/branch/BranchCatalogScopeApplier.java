package br.com.gesint.core.branch;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import br.com.gesint.modules.cfg.access.branch.service.IBranchAccessService;
import br.com.gesint.modules.root.security.BranchAccessResolver.BranchSummary;
import br.com.gesint.modules.root.security.SystemAdminUsers;

/**
 * Aplica {@code company_id} em cadastros de catalogo ({@link BranchCatalogEntity}), validando que a
 * filial escolhida esta entre as acessiveis ao usuario autenticado.
 */
@Component
public class BranchCatalogScopeApplier {

    private final IBranchAccessService branchAccessService;

    public BranchCatalogScopeApplier(IBranchAccessService branchAccessService) {
        this.branchAccessService = branchAccessService;
    }

    public void apply(BranchCatalogEntity entity, UUID companyId) {
        if (companyId == null) {
            entity.setCompanyId(null);
            return;
        }
        Set<UUID> accessibleBranchIds = accessibleBranchIds();
        if (!accessibleBranchIds.contains(companyId)) {
            throw BranchException.accessDenied();
        }
        entity.setCompanyId(companyId);
    }

    private Set<UUID> accessibleBranchIds() {
        UUID userId = SystemAdminUsers.currentUserId().orElseThrow(BranchException::accessDenied);
        return branchAccessService.findAccessibleBranches(userId).stream()
                .map(BranchSummary::id)
                .collect(Collectors.toSet());
    }
}
