package br.com.gommo.core.tenant;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Clona tabelas do template {@code public} que faltam em tenants ja provisionados.
 * Idempotente — roda no startup como rede de seguranca alem da migration V97.
 */
@Component
public class TenantMissingTableRepair {

    private static final Logger log = LoggerFactory.getLogger(TenantMissingTableRepair.class);

    private static final List<String> REQUIRED_TABLES = List.of("candidate_experience");

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

    private final JdbcTemplate jdbcTemplate;

    public TenantMissingTableRepair(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int repairAllTenants() {
        Set<String> schemas = resolveTenantSchemas();
        int repairedSchemas = 0;
        for (String schema : schemas) {
            try {
                if (repairSchema(schema) > 0) {
                    repairedSchemas++;
                }
            } catch (RuntimeException ex) {
                log.error("Falha ao reparar schema {}: {}", schema, ex.getMessage());
            }
        }
        return repairedSchemas;
    }

    private int repairSchema(String rawSchema) {
        String schema = TenantSchemaNames.requireSafe(rawSchema);
        if ("public".equalsIgnoreCase(schema) || !tableExists(schema, "candidate")) {
            return 0;
        }
        int repaired = 0;
        for (String table : REQUIRED_TABLES) {
            repaired += cloneTableIfMissing(schema, table);
        }
        return repaired;
    }

    private int cloneTableIfMissing(String schema, String table) {
        if (!tableExists("public", table) || tableExists(schema, table)) {
            return 0;
        }
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE " + quoted(schema, table) + " (LIKE public." + quotedIdent(table)
                            + " INCLUDING ALL)");
            log.warn("Tabela {}.{} criada a partir do template public.", schema, table);
            return 1;
        } catch (DataAccessException ex) {
            log.error("Falha ao criar {}.{}: {}", schema, table, ex.getMessage());
            return 0;
        }
    }

    private Set<String> resolveTenantSchemas() {
        Set<String> schemas = new LinkedHashSet<>();
        try {
            schemas.addAll(jdbcTemplate.queryForList(SELECT_SCHEMAS_FROM_ADMIN, String.class));
        } catch (DataAccessException ex) {
            log.debug("admin.client_environment_config indisponivel para reparo de tabelas: {}", ex.getMessage());
        }
        try {
            schemas.addAll(jdbcTemplate.queryForList(SELECT_TENANT_SCHEMAS, String.class));
        } catch (DataAccessException ex) {
            log.warn("Nao foi possivel listar schemas tenant_* para reparo de tabelas: {}", ex.getMessage());
        }
        return schemas;
    }

    private boolean tableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT to_regclass(?) IS NOT NULL", Boolean.class, quoted(schema, table));
        return Boolean.TRUE.equals(exists);
    }

    private static String quoted(String schema, String table) {
        return "\"" + schema + "\".\"" + table + "\"";
    }

    private static String quotedIdent(String name) {
        return "\"" + name + "\"";
    }
}
