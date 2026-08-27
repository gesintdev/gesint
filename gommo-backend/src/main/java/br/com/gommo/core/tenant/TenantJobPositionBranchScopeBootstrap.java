package br.com.gommo.core.tenant;

import java.util.LinkedHashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Garante {@code job_position.company_id} nos schemas de tenant ja provisionados.
 *
 * <p>O Flyway migra apenas {@code public}; a V93 espelha a coluna nos {@code tenant_*}, mas se o
 * deploy falhar no meio ou o jar antigo continuar rodando, a API quebra com "column company_id does
 * not exist". Este bootstrap e idempotente e roda apos o Flyway em todo start.
 */
@Component
public class TenantJobPositionBranchScopeBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TenantJobPositionBranchScopeBootstrap.class);

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
    private final boolean enabled;

    public TenantJobPositionBranchScopeBootstrap(
            JdbcTemplate jdbcTemplate,
            @Value("${gommo.tenant-schema.repair-job-position-branch-scope-on-startup:true}") boolean enabled) {
        this.jdbcTemplate = jdbcTemplate;
        this.enabled = enabled;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        Set<String> schemas = resolveTenantSchemas();
        if (schemas.isEmpty()) {
            return;
        }

        int repaired = 0;
        for (String schema : schemas) {
            if (repairSchema(schema)) {
                repaired++;
            }
        }

        if (repaired > 0) {
            log.info("Reparo de job_position.company_id: {} schema(s) de tenant atualizado(s).", repaired);
        }
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

    private boolean repairSchema(String rawSchema) {
        String schema = TenantSchemaNames.requireSafe(rawSchema);
        if ("public".equalsIgnoreCase(schema)) {
            return false;
        }

        Boolean hasTable = jdbcTemplate.queryForObject(
                "SELECT to_regclass(?) IS NOT NULL", Boolean.class, quoted(schema, "job_position"));
        if (!Boolean.TRUE.equals(hasTable)) {
            return false;
        }

        Boolean hasColumn = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1
                      FROM information_schema.columns
                     WHERE table_schema = ?
                       AND table_name = 'job_position'
                       AND column_name = 'company_id'
                )
                """,
                Boolean.class,
                schema);
        if (Boolean.TRUE.equals(hasColumn)) {
            return false;
        }

        try {
            jdbcTemplate.execute("ALTER TABLE " + quoted(schema, "job_position") + " ADD COLUMN company_id UUID");
            jdbcTemplate.execute(
                    "CREATE INDEX IF NOT EXISTS idx_job_position_company ON "
                            + quoted(schema, "job_position")
                            + " (company_id) WHERE status <> 'DELETED'");
            log.warn("Coluna job_position.company_id criada no schema {}.", schema);
            return true;
        } catch (DataAccessException ex) {
            log.error("Falha ao reparar job_position.company_id no schema {}: {}", schema, ex.getMessage());
            return false;
        }
    }

    private static String quoted(String schema, String table) {
        return "\"" + schema + "\".\"" + table + "\"";
    }
}
