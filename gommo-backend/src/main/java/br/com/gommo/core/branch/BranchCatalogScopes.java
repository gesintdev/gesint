package br.com.gommo.core.branch;

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

    public static boolean isSharedAcrossBranches(BranchCatalogEntity entity) {
        return entity != null && entity.getCompanyId() == null;
    }
}
