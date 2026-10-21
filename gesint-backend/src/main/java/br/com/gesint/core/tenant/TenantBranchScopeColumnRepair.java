package br.com.gesint.core.tenant;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Repara colunas de escopo por filial nos schemas de tenant ja provisionados.
 *
 * <p>O Flyway migra apenas {@code public}; tenants antigos ficam sem {@code company_id} e sem as
 * colunas de hierarquia em {@code company}. A V94 espelha tudo no migrate; este reparo e idempotente
 * e roda no startup como rede de seguranca.
 */
@Component
public class TenantBranchScopeColumnRepair {

    private static final Logger log = LoggerFactory.getLogger(TenantBranchScopeColumnRepair.class);

    private static final String SELECT_SCHEMAS_FROM_ADMIN =
            """
            SELECT DISTINCT cec.database_schema
              FROM admin.client_environment_config cec
             WHERE cec.status <> 'DELETED'
               AND cec.database_schema IS NOT NULL
               AND cec.database_schema <> 'public'
            """;

    private static final String SELECT_TENANT_SCHEMAS =
            """
            SELECT schema_name
              FROM information_schema.schemata
             WHERE schema_name LIKE 'tenant\\_%' ESCAPE '\\'
            """;

    private static final String SELECT_PUBLIC_TABLES_WITH_COMPANY_ID =
            """
            SELECT c.table_name
              FROM information_schema.columns c
             WHERE c.table_schema = 'public'
               AND c.column_name = 'company_id'
               AND c.table_name <> 'company'
             ORDER BY c.table_name
            """;

    private final JdbcTemplate jdbcTemplate;

    public TenantBranchScopeColumnRepair(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int repairAllTenants() {
        Set<String> schemas = resolveTenantSchemas();
        if (schemas.isEmpty()) {
            return 0;
        }

        List<String> tablesWithCompanyId = jdbcTemplate.queryForList(
                SELECT_PUBLIC_TABLES_WITH_COMPANY_ID, String.class);

        int repairedSchemas = 0;
        for (String schema : schemas) {
            if (repairSchema(schema, tablesWithCompanyId) > 0) {
                repairedSchemas++;
            }
        }
        return repairedSchemas;
    }

    private Set<String> resolveTenantSchemas() {
        Set<String> schemas = new LinkedHashSet<>();
        try {
            schemas.addAll(jdbcTemplate.queryForList(SELECT_SCHEMAS_FROM_ADMIN, String.class));
        } catch (DataAccessException ex) {
            log.debug("admin.client_environment_config indisponivel para reparo de tenant: {}", ex.getMessage());
        }
        try {
            schemas.addAll(jdbcTemplate.queryForList(SELECT_TENANT_SCHEMAS, String.class));
        } catch (DataAccessException ex) {
            log.warn("Nao foi possivel listar schemas tenant_* para reparo: {}", ex.getMessage());
        }
        return schemas;
    }

    private int repairSchema(String rawSchema, List<String> tablesWithCompanyId) {
        String schema = TenantSchemaNames.requireSafe(rawSchema);
        if ("public".equalsIgnoreCase(schema)) {
            return 0;
        }

        int repaired = 0;
        repaired += repairCompanyHierarchy(schema);
        for (String table : tablesWithCompanyId) {
            repaired += repairCompanyIdColumn(schema, table);
        }
        return repaired;
    }

    private int repairCompanyHierarchy(String schema) {
        if (!tableExists(schema, "company")) {
            return 0;
        }

        int repaired = 0;
        repaired += addColumnIfMissing(schema, "company", "parent_id", "UUID");
        repaired += addColumnIfMissing(schema, "company", "is_headquarters", "BOOLEAN NOT NULL DEFAULT false");
        repaired += addColumnIfMissing(schema, "company", "sort_order", "INTEGER NOT NULL DEFAULT 0");
        return repaired;
    }

    private int repairCompanyIdColumn(String schema, String table) {
        if (!tableExists(schema, table) || columnExists(schema, table, "company_id")) {
            return 0;
        }

        try {
            jdbcTemplate.execute(
                    "ALTER TABLE " + quoted(schema, table) + " ADD COLUMN company_id UUID");
            log.warn("Coluna {}.{}.company_id criada.", schema, table);
            return 1;
        } catch (DataAccessException ex) {
            log.error("Falha ao reparar {}.{}.company_id: {}", schema, table, ex.getMessage());
            return 0;
        }
    }

    private int addColumnIfMissing(String schema, String table, String column, String type) {
        if (!tableExists(schema, table) || columnExists(schema, table, column)) {
            return 0;
        }

        try {
            jdbcTemplate.execute("ALTER TABLE " + quoted(schema, table) + " ADD COLUMN " + column + " " + type);
            log.warn("Coluna {}.{}.{} criada.", schema, table, column);
            return 1;
        } catch (DataAccessException ex) {
            log.error("Falha ao reparar {}.{}.{}: {}", schema, table, column, ex.getMessage());
            return 0;
        }
    }

    private boolean tableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT to_regclass(?) IS NOT NULL", Boolean.class, quoted(schema, table));
        return Boolean.TRUE.equals(exists);
    }

    private boolean columnExists(String schema, String table, String column) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                      FROM information_schema.columns
                     WHERE table_schema = ?
                       AND table_name = ?
                       AND column_name = ?
                )
                """,
                Boolean.class,
                schema,
                table,
                column);
        return Boolean.TRUE.equals(exists);
    }

    private static String quoted(String schema, String table) {
        return "\"" + schema + "\".\"" + table + "\"";
    }
}
