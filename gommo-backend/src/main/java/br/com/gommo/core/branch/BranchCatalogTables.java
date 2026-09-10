package br.com.gommo.core.branch;

import java.util.Set;

/**
 * Tabelas com {@code company_id} opcional: nulo = compartilhado entre filiais.
 *
 * SQL nativo usa o predicado {@code (company_id IS NULL OR company_id = :branchId)}.
 */
public final class BranchCatalogTables {

    public static final Set<String> NAMES = Set.of("department", "job_position", "exam_requirement", "search_document");

    private BranchCatalogTables() {}

    public static boolean isCatalogScoped(String tableName) {
        return tableName != null && NAMES.contains(tableName.trim().toLowerCase());
    }
}
