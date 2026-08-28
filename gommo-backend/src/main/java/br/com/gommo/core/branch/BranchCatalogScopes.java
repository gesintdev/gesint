package br.com.gommo.core.branch;

import java.util.UUID;

/**
 * Aplica o escopo de filial em cadastros compartilhados opcionalmente ({@link BranchCatalogEntity}).
 */
public final class BranchCatalogScopes {

    private BranchCatalogScopes() {}

    public static void apply(BranchCatalogEntity entity, Boolean sharedAcrossBranches) {
        if (Boolean.TRUE.equals(sharedAcrossBranches)) {
            entity.setCompanyId(null);
            return;
        }
        entity.setCompanyId(BranchContextHolder.require());
    }

    /**
     * Resolve o {@code company_id} do request, mantendo compatibilidade com o campo booleano legado.
     */
    public static UUID resolveCompanyId(UUID companyId, Boolean sharedAcrossBranches) {
        if (companyId != null || sharedAcrossBranches == null) {
            return companyId;
        }
        return Boolean.TRUE.equals(sharedAcrossBranches) ? null : BranchContextHolder.require();
    }

    public static boolean isSharedAcrossBranches(BranchCatalogEntity entity) {
        return entity != null && entity.getCompanyId() == null;
    }
}
