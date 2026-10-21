package br.com.gesint.core.tenant;

import java.util.LinkedHashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Propaga {@code company_id} da entidade indexada para {@code search_document}. Idempotente — roda
 * no startup como rede de seguranca apos a V96 (ou correcoes manuais pontuais).
 */
@Component
public class TenantSearchDocumentBranchScopeDataRepair {

    private static final Logger log = LoggerFactory.getLogger(TenantSearchDocumentBranchScopeDataRepair.class);

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

    public TenantSearchDocumentBranchScopeDataRepair(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int repairAllTenants() {
        Set<String> schemas = resolveTenantSchemas();
        int repairedSchemas = 0;
        for (String schema : schemas) {
            if (repairSchema(schema) > 0) {
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
            log.debug("admin.client_environment_config indisponivel para reparo de search_document: {}", ex.getMessage());
        }
        try {
            schemas.addAll(jdbcTemplate.queryForList(SELECT_TENANT_SCHEMAS, String.class));
        } catch (DataAccessException ex) {
            log.warn("Nao foi possivel listar schemas tenant_* para reparo de search_document: {}", ex.getMessage());
        }
        return schemas;
    }

    private int repairSchema(String rawSchema) {
        String schema = TenantSchemaNames.requireSafe(rawSchema);
        if ("public".equalsIgnoreCase(schema)) {
            return 0;
        }
        if (!tableExists(schema, "search_document")) {
            return 0;
        }

        int repaired = 0;
        repaired += propagateFromJobPosition(schema);
        repaired += propagateFromDepartment(schema);
        repaired += propagateFromAdmission(schema);
        repaired += propagateFromCollaborator(schema);
        return repaired > 0 ? 1 : 0;
    }

    private int propagateFromJobPosition(String schema) {
        if (!tableExists(schema, "job_position")) {
            return 0;
        }
        return update(
                schema,
                """
                UPDATE %s.search_document sd
                   SET company_id = jp.company_id
                  FROM %s.job_position jp
                 WHERE sd.document_type = 'JOB_POSITION'
                   AND sd.entity_id = jp.id
                   AND sd.status <> 'DELETED'
                   AND (sd.company_id IS DISTINCT FROM jp.company_id)
                """);
    }

    private int propagateFromDepartment(String schema) {
        if (!tableExists(schema, "department")) {
            return 0;
        }
        return update(
                schema,
                """
                UPDATE %s.search_document sd
                   SET company_id = d.company_id
                  FROM %s.department d
                 WHERE sd.document_type = 'DEPARTMENT'
                   AND sd.entity_id = d.id
                   AND sd.status <> 'DELETED'
                   AND (sd.company_id IS DISTINCT FROM d.company_id)
                """);
    }

    private int propagateFromAdmission(String schema) {
        if (!tableExists(schema, "admission_process")) {
            return 0;
        }
        return update(
                schema,
                """
                UPDATE %s.search_document sd
                   SET company_id = ap.company_id
                  FROM %s.admission_process ap
                 WHERE sd.document_type = 'ADMISSION'
                   AND sd.entity_id = ap.id
                   AND sd.status <> 'DELETED'
                   AND ap.company_id IS NOT NULL
                   AND (sd.company_id IS DISTINCT FROM ap.company_id)
                """);
    }

    private int propagateFromCollaborator(String schema) {
        if (!tableExists(schema, "collaborator")) {
            return 0;
        }
        return update(
                schema,
                """
                UPDATE %s.search_document sd
                   SET company_id = c.company_id
                  FROM %s.collaborator c
                 WHERE sd.document_type = 'PERSON'
                   AND sd.entity_id = c.id
                   AND sd.status <> 'DELETED'
                   AND c.company_id IS NOT NULL
                   AND (sd.company_id IS DISTINCT FROM c.company_id)
                """);
    }

    private int update(String schema, String sqlTemplate) {
        try {
            return jdbcTemplate.update(sqlTemplate.formatted(quoted(schema), quoted(schema)));
        } catch (DataAccessException ex) {
            log.error("Falha ao propagar company_id em {}.search_document: {}", schema, ex.getMessage());
            return 0;
        }
    }

    private boolean tableExists(String schema, String table) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT to_regclass(?) IS NOT NULL", Boolean.class, quoted(schema, table));
        return Boolean.TRUE.equals(exists);
    }

    private static String quoted(String schema) {
        return "\"" + schema + "\"";
    }

    private static String quoted(String schema, String table) {
        return "\"" + schema + "\".\"" + table + "\"";
    }
}
